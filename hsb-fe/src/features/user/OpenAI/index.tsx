import React from 'react';
import AssistantWidget from './components/AssistantWidget';

export default function Assistant() {
  const inferContext = () =>
    `path=${window.location.pathname} | ABOUT/PROJECTS/SKILLS/SECURITIES/DEPLOY/SECTIONS 개요`;
  return <AssistantWidget inferContext={inferContext} />;
}
