import { ActiveLink } from "@components/ui/common";
import React from "react";

const BreadcrumbItem = ({ item, index }) => {
  return (
    <li
      className={`${
        index == 0 ? "pr-4" : "px-4"
      } font-medium text-black hover:text-gray-900`}
    >
      <ActiveLink href={item.href}>
        <a>{item.value}</a>
      </ActiveLink>
    </li>
  );
};

// breadcrumps are a type of navigational aid that hsows users where they are on your wbesote
// usually appear as secondary naviagational bar at the top of a web oage
export default function Breadcrumbs({ items, isAdmin }) {
  return (
    <nav aria-label="breadcrumb">
      <ol className="flex leading-none text-indigo-600 divide-x divide-indigo-400">
        {items.map((item, i) => (
          <React.Fragment key={item.href}>
            {!item.requireAdmin && <BreadcrumbItem item={item} index={i} />}
            {/* "/marketplace/books/manage" only admin can view this */}
            {item.requireAdmin && isAdmin && (
              <BreadcrumbItem item={item} index={i} />
            )}
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}
