const PlaceholderIcon = ({ className = "" }) => (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className={className}>
        <rect x="3" y="3" width="30" height="30" rx="10" stroke="currentColor" strokeWidth="1.5" className="text-gray-200 dark:text-gray-600" fill="none" />
        <polygon
          points="15,11 21,11 17,19 23,19 13,25 17,17 11,17"
          fill="currentColor"
          className="text-gray-300 dark:text-gray-700"
        />
      </svg>
);

export default PlaceholderIcon;