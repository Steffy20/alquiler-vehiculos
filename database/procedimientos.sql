-- Ejecutar este archivo en pgAdmin sobre la base de datos alquiler de vehiculos.

CREATE OR REPLACE PROCEDURE public.registrar_reserva(
    IN p_id_cliente integer, IN p_id_vehiculo integer,
    IN p_id_sucursal_entrega integer, IN p_id_sucursal_devolucion integer,
    IN p_fecha_inicio timestamp without time zone,
    IN p_fecha_fin timestamp without time zone,
    IN p_total numeric, IN p_observaciones character varying
)
LANGUAGE plpgsql AS $$
BEGIN
    IF p_fecha_inicio IS NULL OR p_fecha_fin IS NULL THEN
        RAISE EXCEPTION 'Las fechas de inicio y fin son obligatorias';
    END IF;
    IF p_fecha_fin <= p_fecha_inicio THEN
        RAISE EXCEPTION 'La fecha de fin debe ser posterior a la fecha de inicio';
    END IF;
    IF p_total IS NULL OR p_total < 0 THEN
        RAISE EXCEPTION 'El total de la reserva no puede ser negativo';
    END IF;

    INSERT INTO public.reserva
        (id_cliente, id_vehiculo, id_sucursal_entrega, id_sucursal_devolucion,
         fecha_inicio, fecha_fin, estado, total_estimado, observaciones)
    VALUES
        (p_id_cliente, p_id_vehiculo, p_id_sucursal_entrega, p_id_sucursal_devolucion,
         p_fecha_inicio, p_fecha_fin, 'Pendiente', ROUND(p_total, 2), LEFT(p_observaciones, 200));
END;
$$;

CREATE OR REPLACE PROCEDURE public.cancelar_reserva(IN p_id_reserva integer)
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.reserva WHERE id_reserva = p_id_reserva) THEN
        RAISE EXCEPTION 'La reserva % no existe', p_id_reserva;
    END IF;
    UPDATE public.reserva
    SET estado = 'Cancelada'
    WHERE id_reserva = p_id_reserva AND estado <> 'Cancelada';
END;
$$;

CREATE OR REPLACE PROCEDURE public.registrar_pago(
    IN p_id_reserva integer, IN p_monto numeric,
    IN p_metodo_pago character varying, IN p_referencia character varying,
    IN p_estado character varying
)
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.reserva WHERE id_reserva = p_id_reserva) THEN
        RAISE EXCEPTION 'La reserva % no existe', p_id_reserva;
    END IF;
    IF p_monto IS NULL OR p_monto <= 0 THEN
        RAISE EXCEPTION 'El monto del pago debe ser mayor que cero';
    END IF;

    INSERT INTO public.pago (id_reserva, monto, metodo_pago, referencia, estado)
    VALUES (p_id_reserva, ROUND(p_monto, 2), LEFT(p_metodo_pago, 30),
            LEFT(p_referencia, 100), LEFT(p_estado, 20));

    IF LOWER(COALESCE(p_estado, '')) IN ('completado', 'completada', 'pagado') THEN
        UPDATE public.reserva
        SET estado = 'Confirmada'
        WHERE id_reserva = p_id_reserva AND estado <> 'Cancelada';
    END IF;
END;
$$;
