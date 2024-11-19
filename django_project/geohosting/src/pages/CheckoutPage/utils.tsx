import { SalesOrder } from "../../redux/reducers/salesOrdersSlice";

export function checkCheckoutUrl(salesOrder: SalesOrder, navigate) {
  // Check checkout url
  const originalUrl = location.href.replace(location.origin, '')
  let targetUrl = originalUrl;
  if (salesOrder.app_name) {
    localStorage.setItem('appName', '');
  }
  switch (salesOrder.order_status) {
    case 'Waiting Payment':
      targetUrl = `/orders/${salesOrder.id}/payment`
      break
    case 'Waiting Configuration':
      targetUrl = `/orders/${salesOrder.id}/configuration`
      break
    case 'Waiting Deployment':
      targetUrl = `/orders/${salesOrder.id}/deployment`
      break
    case 'Deployed':
      targetUrl = `/dashboard`
      break
  }
  if (originalUrl.replace('/#', '') != targetUrl) {
    navigate(targetUrl)
  }
}