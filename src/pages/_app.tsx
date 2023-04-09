import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import dynamic from 'next/dynamic'
import React from 'react'
const NoSSR = props => (
  <React.Fragment>{props.children}</React.Fragment>
)

export default function App({ Component, pageProps }: AppProps) {
  return <NoSSR><Component {...pageProps} /></NoSSR>
}
