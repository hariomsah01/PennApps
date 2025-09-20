# Components

This directory contains all your React components.

## Structure

- Create individual component folders for complex components
- Each component should have its own file (e.g., `Button.js`, `Header.js`)
- For components with multiple files, create a folder (e.g., `Header/Header.js`, `Header/Header.css`)

## Example Component

```jsx
// Button.js
import React from 'react';
import './Button.css';

const Button = ({ children, onClick, variant = 'primary' }) => {
  return (
    <button 
      className={`btn btn-${variant}`} 
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
```
