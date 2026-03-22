import Header from './components/header/header';
import ShopTabs from "./components/shop-tabs/shop-tabs";
import { Sale } from './interfaces/sale.interface';

function exchangePrice( price: string, rate: number, commission: number ): number {
  const formattedPrice = price.match( /[\d,]+\.?\d*/ )?.[ 0 ]?.replace( /,/g, '' ) || '0';
  return +( parseFloat( formattedPrice ) * rate * commission ).toFixed( 2 );
}

async function getSales(): Promise<Sale[]> {
  const res = await fetch( 'http://localhost:3000/api/sale' );
  return res.json();
}

async function exchangePrices( sales: Sale[], exchanges: any[] ) {
  return sales.map( ( sale: Sale ) => {
    const exchange = exchanges.find( e => e.cc === sale.currency );
    const rate = exchange ? exchange.rate : 1;
    sale.products = sale.products.map( product => ( {
      ...product,
      exchangedPrice: exchangePrice( product.price, rate, sale.commission )
    } ) );

    return sale;
  } );
}

async function getExchanges() {
  const res = await fetch( 'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json' );
  return res.json();
}

export default async function Home() {
  const sales = await getSales();
  const exchanges = await getExchanges();

  const formattedSales = await exchangePrices( sales, exchanges );
  console.log( '[SALES]', formattedSales );

  return (
    <div>
      <Header exchanges={exchanges} />
      <div style={{ padding: "20px" }}>
        <h1>Знижки сьогодні</h1>
        <ShopTabs sales={formattedSales} exchanges={exchanges} />
      </div>
    </div>
  );
}