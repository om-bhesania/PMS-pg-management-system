import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/react";
import {useSearchParams} from 'react-router-dom'




const Breadcrumbs = ({ customClass }) => {
  const { params } = useSearchParams();
  const currentpage = window.location.pathname;
  return (
    <>
      <Breadcrumb
        spacing="8px"
        separator={<i className="fa-regular fa-chevron-right"></i>}
        className="font-bold font-primary text-gray-500"
      >
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink
            className={`capitalize ${customClass ? customClass : ""}`}
          >
            {currentpage.replace("/", "")}
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
    </>
  );
};

export default Breadcrumbs