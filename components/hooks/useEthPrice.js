import useSWR from "swr";

const URL =
  "https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false";

const fetcher = async (url) => {
  const res = await fetch(url);
  const json = await res.json();

  return json.market_data.current_price.usd ?? null;
};

export const useEthPrice = (course_price) => {
  const { data, ...rest } = useSWR(URL, fetcher, { refreshInterval: 10000 });
  //  method converts a number to a string. The toFixed() method rounds the string to a specified number of decimals.
  const itemPrice = (data && (course_price / Number(data)).toFixed(6)) ?? null;
  // console.log("itemprice", itemPrice);
  return { eth: { data, itemPrice, ...rest } };
};
