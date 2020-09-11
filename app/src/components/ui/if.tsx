import { FunctionalComponent } from '@stencil/core';

interface props {
  if: boolean;
}

export const If: FunctionalComponent<props> = (p, children) => {
  if (p.if) {
    return children;
  }
};
