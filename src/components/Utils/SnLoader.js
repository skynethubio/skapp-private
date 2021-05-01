import React from "react"
import "./SnLoaderStyles.css"
import { useSelector } from "react-redux"

export default function SnLoader(props) {
  const snLoader = useSelector((state) => state.snLoader)
  return (
    <>
      {snLoader && (
        // <div className="sn-loader-overlay">
        //   <div className="loader" />
        // </div>
        <div className="sn-loader-overlay">
          <div class="lds-default"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
        </div>
      )}
    </>
  )
}
