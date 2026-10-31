import { useOutletContext } from 'react-router-dom';
import { formatCurrency } from '../../utils/currency';
import './AdminOrders.css';
import './AdminTables.css';

const AdminOrders = () => {
  const { orders, loading, orderError, orderStatuses, setOrderStatuses, updatingOrderId, handleOrderStatusChange } = useOutletContext();

  return (
    <section className="admin-section admin-orders-section" id="orders" aria-labelledby="orders-heading">
      <div className="inventory-heading">
        <div><span className="admin-eyebrow">FULFILLMENT</span><h1 id="orders-heading">Orders <span className="inventory-count">{orders.length}</span></h1></div>
      </div>
      {orderError && <div className="admin-error" role="alert">{orderError}</div>}
      {loading ? <p className="admin-status">Loading orders...</p> : orders.length === 0 ? <p className="admin-status">No customer orders yet.</p> : (
        <div className="admin-table-wrapper">
          <table className="admin-table orders-admin-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Ship to</th><th>Items</th><th>Total / payment</th><th>Status</th><th>Update</th></tr></thead>
            <tbody>
              {orders.map(order => {
                const selectedStatus = orderStatuses[order._id] || order.orderStatus;
                return (
                  <tr key={order._id}>
                    <td><strong>#{order._id.slice(-6).toUpperCase()}</strong><span className="admin-order-date">{new Date(order.createdAt).toLocaleDateString('en-IN')}</span></td>
                    <td><strong>{order.user?.name || 'Customer'}</strong><span className="admin-order-date">{order.user?.email || 'Account unavailable'}</span></td>
                    <td><strong>{order.shippingAddress.fullName}</strong><span className="admin-order-date">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</span><span className="admin-order-date">{order.shippingAddress.phone}</span></td>
                    <td>{order.orderItems.map((item, index) => <span className="admin-order-item" key={`${item.product}-${index}`}>{item.qty}× {item.name} ({item.size})</span>)}</td>
                    <td><strong>{formatCurrency(order.totalPrice)}</strong><span className="admin-order-date">{order.paymentMethod} · {order.isPaid ? 'Paid' : 'Unpaid'}</span></td>
                    <td>
                      <select className="admin-order-status-select" aria-label={`Status for order ${order._id.slice(-6)}`} value={selectedStatus} onChange={event => setOrderStatuses(current => ({ ...current, [order._id]: event.target.value }))} disabled={order.orderStatus === 'Cancelled'}>
                        {order.orderStatus === 'Payment Pending' && <option value="Payment Pending">Payment Pending</option>}
                        {['Processing', 'Shipped', 'Delivered'].map(status => <option key={status} value={status}>{status}</option>)}
                        {order.paymentMethod === 'COD' && <option value="Cancelled">Cancelled</option>}
                      </select>
                    </td>
                    <td><button type="button" className="btn-edit" disabled={selectedStatus === order.orderStatus || updatingOrderId === order._id} onClick={() => handleOrderStatusChange(order._id)}>{updatingOrderId === order._id ? 'Saving...' : 'Save'}</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default AdminOrders;