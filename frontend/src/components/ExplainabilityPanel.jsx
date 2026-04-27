import React from 'react';

export default function ExplainabilityPanel({ features, confidence }) {
  return (
    <div className="explain-card fade-in">
      <div className="explain-title">
        Why this route?
      </div>

      {features.map((feature, idx) => (
        <div className="feature-row" key={idx}>
          <div className="feature-label">
            <span className="feature-name">{feature.name}</span>
            <span className="feature-value">{feature.impact}%</span>
          </div>
          <div className="feature-bar">
            <div
              className="feature-fill"
              style={{ width: `${feature.impact}%` }}
            />
          </div>
        </div>
      ))}

      <div className="explain-note">
        Our AI analyzed historical traffic patterns, current conditions, and
        time-based trends to predict congestion 20 minutes ahead and select the
        smartest route for you.
      </div>
    </div>
  );
}
