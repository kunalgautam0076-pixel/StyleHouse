import { Link } from 'react-router-dom';
import './DriftWall.css';

export default function DriftWall({
  items,
  columns = 5,
  tileWidth = 200,
  tileHeight = 132,
  gap = 18,
  tilt = 16,
  turn = -14,
  perspective = 1200,
  depth = 120,
  speed = 42,
  direction = 'up',
  variance = 0.45,
  parallax = 0.6,
  lift = 64,
  fade = 0.6,
  dim = 0.55,
  overlayColor = '#060010',
  radius = 14,
  roll = 0,
  pauseOnHover = false,
  grayscale = false,
}) {
  const wallColumns = Array.from({ length: columns }, (_, columnIndex) => {
    const columnItems = items.map((_, itemIndex) => items[(itemIndex + columnIndex) % items.length]);

    return (
      <div
        className="drift-wall-column"
        key={`column-${columnIndex}`}
        style={{
          '--column-index': columnIndex,
          '--column-speed': `${speed * (1 + (columnIndex % 3) * 0.12) * (1 + parallax * 0.25)}s`,
          '--column-delay': `${columnIndex % 2 === 0 ? 0 : speed * -0.5}s`,
          '--column-depth': `${(columnIndex / columns) * depth}px`,
        }}
      >
        {[0, 1].map(copy => (
          <div
            className="drift-wall-sequence"
            key={`sequence-${copy}`}
            aria-hidden={copy === 1}
          >
            {columnItems.map((item, itemIndex) => {
              const Tile = item.href ? Link : 'div';
              const tileKey = `${copy}-${item.title}-${itemIndex}`;
              const tileProps = {
                className: 'drift-wall-tile',
                ...(item.href ? { to: item.href } : {}),
                ...(item.href && copy === 1 ? { tabIndex: -1 } : {}),
                ...(item.href && copy === 0 ? { 'aria-label': item.title } : {}),
                style: {
                  '--tile-lift': `${lift * (variance - 0.5) * (itemIndex % 2 === 0 ? 2 : -2)}px`,
                  '--tile-roll': `${roll + (itemIndex % 3 === 2 ? -2 : 0)}deg`,
                },
              };

              return (
                <Tile {...tileProps} key={tileKey}>
                  <img
                    src={item.image}
                    alt={copy === 0 ? item.title : ''}
                    loading={columnIndex < 3 && copy === 0 ? 'eager' : 'lazy'}
                  />
                </Tile>
              );
            })}
          </div>
        ))}
      </div>
    );
  });

  const style = {
    '--wall-columns': columns,
    '--wall-tile-width': `${tileWidth}px`,
    '--wall-tile-height': `${tileHeight}px`,
    '--wall-gap': `${gap}px`,
    '--wall-tilt': `${tilt}deg`,
    '--wall-turn': `${turn}deg`,
    '--wall-perspective': `${perspective}px`,
    '--wall-depth': `${depth}px`,
    '--wall-speed': `${speed}s`,
    '--wall-variance': variance,
    '--wall-parallax': parallax,
    '--wall-lift': `${lift}px`,
    '--wall-fade': fade,
    '--wall-dim': dim,
    '--wall-brightness': (1 - dim * 0.35).toFixed(3),
    '--wall-overlay': overlayColor,
    '--wall-radius': `${radius}px`,
    '--wall-roll': `${roll}deg`,
  };

  return (
    <div
      className={`drift-wall${direction === 'down' ? ' drift-wall--down' : ''}${pauseOnHover ? ' drift-wall--pause' : ''}${grayscale ? ' drift-wall--grayscale' : ''}`}
      style={style}
      role="group"
      aria-label="Featured fashion looks"
    >
      <div className="drift-wall-grid">{wallColumns}</div>
      <div className="drift-wall-overlay" aria-hidden="true" />
    </div>
  );
}
