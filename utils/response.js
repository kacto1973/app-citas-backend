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

/*

Así se ve lo que recibe el front, ya con la capa de envoltorio de axios

axiosResponse = {
  data: {
    ok: true,
    data: {
      expiresAt: "2026-01-13T05:36:31.395Z"
    },
    error: null
  },
  status: 200,
  statusText: "OK",
  headers: { ... },
  config: { ... },
  request: { ... }
}

entonces debes hacer data.data.expiresAt para obtener el valor real (o cualquier otra propiedad que ocupes)
  */
