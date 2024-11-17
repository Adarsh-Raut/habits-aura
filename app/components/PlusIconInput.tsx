import Link from "next/link";
import React from "react";
import { IoIosAdd } from "react-icons/io";

const PlusIconInput = () => {
  return (
    <Link href="/create">
      <button className="btn btn-ghost">
        <IoIosAdd size={50} />
      </button>
    </Link>
  );
};

export default PlusIconInput;
