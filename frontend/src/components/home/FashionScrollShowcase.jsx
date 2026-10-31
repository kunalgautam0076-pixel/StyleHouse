import DriftWall from './DriftWall';
import fashionLooks from './fashionLooks';
import './FashionScrollShowcase.css';

export default function FashionScrollShowcase({ products = [] }) {
  const productItems = products.flatMap(product => {
    const image = product.images?.find(item => item.isPrimary)?.url || product.images?.[0]?.url;
    if (!image || !product.slug) return [];

    return [{
      image,
      title: product.name,
      href: `/product/${product.slug}`,
    }];
  });
  const items = productItems.length > 0
    ? productItems
    : fashionLooks.map(look => ({
      image: look.image,
      title: look.label,
    }));

  return (
    <section id="fashion-showcase" className="fashion-scroll-section" aria-labelledby="fashion-scroll-title">
      <div className="fashion-scroll-stage">
        <div className="fashion-scroll-copy">
          <span className="fashion-scroll-kicker">StyleHouse / New season</span>
          <h2 id="fashion-scroll-title">Wear the<br /><em>unexpected.</em></h2>
          <p>Considered layers. Natural movement. Pieces that feel like you.</p>
          <a className="fashion-scroll-link" href="#categories">Explore the collection <span aria-hidden="true">↗</span></a>
        </div>

        <DriftWall
          items={items}
          columns={7}
          tileWidth={200}
          tileHeight={260}
          gap={18}
          tilt={16}
          turn={-14}
          perspective={1200}
          depth={120}
          speed={42}
          direction="up"
          variance={0.45}
          parallax={0.6}
          lift={64}
          fade={0.6}
          dim={0.25}
          overlayColor="#102b25"
          radius={14}
          roll={0}
          pauseOnHover={false}
          grayscale={false}
        />
      </div>
    </section>
  );
}
