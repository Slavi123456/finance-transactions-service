-- Custom SQL migration file, put your code below! --
CREATE OR REPLACE FUNCTION cheapest_products_by_month(
  p_user_id uuid,
  p_from    date,
  p_to      date,
  p_limit   int DEFAULT 10
)
RETURNS TABLE (
  category   text,
  month      text,
  product    text,
  min_price  float8,
  price_rank bigint
)
LANGUAGE sql
STABLE
AS $$
  WITH monthly_min AS (
    SELECT
      c.id   AS category_id,
      c.name AS category,
      to_char(date_trunc('month', pu.purchased_on), 'YYYY-MM') AS month,
      p.name AS product,
      MIN(pu.price)::float8 AS min_price
    FROM purchases pu
    JOIN products   p ON p.id = pu.product_id  AND p.user_id = pu.user_id
    JOIN categories c ON c.id = p.category_id  AND c.user_id = p.user_id
    WHERE pu.user_id = p_user_id
      AND pu.purchased_on BETWEEN p_from AND p_to
    GROUP BY c.id, c.name, to_char(date_trunc('month', pu.purchased_on), 'YYYY-MM'), p.id, p.name
  ),
  ranked AS (
    SELECT category, month, product, min_price,
           ROW_NUMBER() OVER (PARTITION BY category_id, month ORDER BY min_price, product) AS price_rank
    FROM monthly_min
  )
  SELECT category, month, product, min_price, price_rank
  FROM ranked
  WHERE price_rank <= p_limit
  ORDER BY category, month, price_rank;