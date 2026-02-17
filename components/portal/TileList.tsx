export default function TileList({ 
  items 
}: { 
  items: Array<{ label: string; value: string | number; onClick?: () => void }>
}) {
  return (
    <div className="portal-tile-list">
      {items.map((item, index) => (
        <div 
          key={index} 
          className="portal-tile"
          onClick={item.onClick}
          style={{ cursor: item.onClick ? 'pointer' : 'default' }}
        >
          <div className="portal-tile-label">{item.label}</div>
          <div className="portal-tile-value">{item.value}</div>
        </div>
      ))}
    </div>
  )
}
