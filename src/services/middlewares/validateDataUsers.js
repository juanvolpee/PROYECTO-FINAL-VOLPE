
export const validateUserRegisterData = (req, res, next) => {
    const { first_name, last_name, age, email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^+&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    if (!first_name || !last_name || !age || !email || !password) {
        return res.status(400).json({ error: "Todos los campos son requeridos." });
    }
    if (typeof first_name !== 'string' || first_name.trim() === '') {
        return res.status(400).json({ error: "El nombre es invalido." });
    }
    if (typeof last_name !== 'string' || last_name.trim() === '') {
        return res.status(400).json({ error: "El apellido es invalido." });
    }
    if (typeof age !== 'number' || age <= 0) {
        return res.status(400).json({ error: "La edad debe ser un numero positivo." });
    }
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: "Ingrese un email valido." });
    }
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ error: "La contraseña debe contener 8 caracteres, una mayuscula y un caracter especial." });
    }

    next();
};
