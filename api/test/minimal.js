export default async function handler(req, res) {
  console.log("MINIMAL: ", req.method, req.url);
  return res.status(200).json({
    success: true,
    message: "Minimal works!",
    path: req.url,
  });
}
