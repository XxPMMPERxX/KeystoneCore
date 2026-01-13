/**
 * JSX Fragment 用の一意な識別子
 */
export const Fragment = Symbol('Fragment');

/**
 * JSX で生成される要素の type
 * - 関数コンポーネント
 * - Fragment
 */
export type JSXElementType =
  | ((props: any) => any)
  | typeof Fragment;

/**
 * JSX のエントリポイント
 */
export function createElement(
  type: JSXElementType,
  props: any,
  ...children: any[]
) {
  // Fragment は children をそのまま展開
  if (type === Fragment) {
    return normalizeChildren(children);
  }

  if (typeof type !== 'function') {
    throw new Error('Invalid JSX element type');
  }

  return type({
    ...(props ?? {}),
    children: normalizeChildren(children),
  });
}

/**
 * JSX children を Form DSL 向けに正規化する
 */
function normalizeChildren(children: any[]): any[] {
  return children
    .flat(Infinity)
    .filter(
      (child) =>
        child !== null &&
        child !== undefined &&
        child !== false
    );
}

/**
 * 開発モード用 JSX エントリポイント
 * デバッグ情報（key, isStaticChildren, source, self）を受け取るが、現在は無視
 */
export function jsxDEV(
  type: JSXElementType,
  props: any,
  ..._deps: unknown[]
) {
  void _deps;
  const children = props?.children;
  const restProps = { ...props };
  delete restProps.children;

  if (type === Fragment) {
    return normalizeChildren(Array.isArray(children) ? children : [children]);
  }

  if (typeof type !== 'function') {
    throw new Error('Invalid JSX element type');
  }

  return type({
    ...restProps,
    children: normalizeChildren(Array.isArray(children) ? children : [children]),
  });
}

export {
  createElement as jsx,
  createElement as jsxs,
};
