const stripe = require("stripe")("sk_test_51RSvqBI8PAfLPUB0YaAdUa59IbB4D4XzMfsw12HbUSsvDOn90V64QX5g0qtKwISmZqJb9aRDaVYYbRYjOyR7trfD00xKSncO6G");

(async () => {
  const customers = await stripe.customers.list();
  console.log(customers);
})();
