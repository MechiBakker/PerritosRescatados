import mercadopago from "mercadopago";

mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

export default async function handler(req, res) {
  const preference = {
    items: [
      {
        title: "Donación Perritos Rescatados",
        quantity: 1,
        unit_price: 1000
      }
    ]
  };

  const response = await mercadopago.preferences.create(preference);

  res.json(response.body);
}