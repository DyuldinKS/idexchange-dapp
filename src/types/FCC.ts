import { FC, PropsWithChildren } from 'react';

/**
 * Functional Component with Children
 * @description https://stackoverflow.com/questions/71788254/react-18-typescript-children-fc
 */
export type FCC<P = {}> = FC<PropsWithChildren<P>>;
