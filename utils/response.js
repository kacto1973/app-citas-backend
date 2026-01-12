//metodos que servirán para normalizar las respuestas del backend
//así el frontend sabrá que esperar en cada caso

export const success = (res, data, status = 200) => {
  return res.status(status).json({
    ok: true,
    data: data,
    error: null,
  });
};

export const fail = (res, errorMessage, status = 400) => {
  return res.status(status).json({
    ok: false,
    data: null,
    error: errorMessage,
  });
};
