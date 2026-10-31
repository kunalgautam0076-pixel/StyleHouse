import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import fashionLooks from './fashionLooks';
import './FashionScrollShowcase.css';

const FashionScrollScene = lazy(() => import('./FashionScrollScene'));

export default function FashionScrollShowcase() {
  const sectionRef = useRef(null);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [texturesReady, setTexturesReady] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    if (!('IntersectionObserver' in window)) {
      setIsNearViewport(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsNearViewport(entry.isIntersecting);
    }, { rootMargin: '100px 0px' });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="fashion-showcase" className="fashion-scroll-section" ref={sectionRef} aria-labelledby="fashion-scroll-title">
      <div className="fashion-scroll-stage">
        <div className="fashion-scroll-copy">
          <span className="fashion-scroll-kicker">StyleHouse / New season</span>
          <h2 id="fashion-scroll-title">Wear the<br /><em>unexpected.</em></h2>
          <p>Considered layers. Natural movement. Pieces that feel like you.</p>
          <a className="fashion-scroll-link" href="#categories">Explore the collection <span aria-hidden="true">↗</span></a>
        </div>

        <div className={`fashion-scroll-fallback${texturesReady ? ' is-hidden' : ''}`} aria-hidden="true">
          {fashionLooks.map((look, index) => (
            <img key={look.label} src={look.image} alt="" className={`fashion-fallback-card fashion-fallback-card-${index + 1}`} />
          ))}
        </div>

        {isNearViewport && (
          <Suspense fallback={null}>
            <FashionScrollScene sectionRef={sectionRef} onReady={setTexturesReady} />
          </Suspense>
        )}

        <div className="fashion-scroll-index" aria-hidden="true" />
      </div>
    </section>
  );
}
