import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce } from "debounce";
import { Box, Flex, Spinner } from '@chakra-ui/react';
import { AsyncThunkConfig } from "@reduxjs/toolkit/dist/createAsyncThunk";
import { AppDispatch, RootState } from "../../redux/store";
import DashboardTitle from "../../components/DashboardPage/DashboardTitle";
import TopNavigation from "../../components/DashboardPage/TopNavigation";
import Pagination from "../../components/Pagination/Pagination";
import { AsyncThunk } from "@reduxjs/toolkit";
import { Instance } from "../../redux/reducers/instanceSlice";

interface Props {
  title: string;
  searchPlaceholder: string;
  stateKey: string;
  action: AsyncThunk<any, string, AsyncThunkConfig>;
  url: string;
  leftNavigation?: React.ReactElement;
  rightNavigation?: React.ReactElement;
  renderCards: (data: any[]) => React.ReactElement;
}

let lastSearchTerm: string | null = null;
let session: string | null = null;

interface RenderContentProps {
  data: Instance[],
  renderCards: (data: any[]) => React.ReactElement;

}

/** Rendering contents **/
const RenderContent: React.FC<RenderContentProps> = (
  { data, renderCards }
) => {
  return renderCards(data)
}

/** Abstract for pagination page */
export const PaginationPage: React.FC<Props> = (
  {
    title, searchPlaceholder, stateKey, action, url,
    leftNavigation, rightNavigation, renderCards
  }
) => {
  const dispatch = useDispatch<AppDispatch>();
  const rowsPerPage = 10;
  const {
    data: listData,
    loading,
    error
  } = useSelector((state: RootState) => state[stateKey]['list']);

  const {
    loading: createLoading,
    error: createError
  } = useSelector((state: RootState) => state[stateKey]['create']);
  const {
    loading: editLoading,
    error: editError
  } = useSelector((state: RootState) => state[stateKey]['edit']);

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');


  /** Check app name */
  const debouncedSearchTerm = debounce((inputValue) => {
    if (lastSearchTerm === inputValue) {
      request()
    }
  }, 500);

  const request = (force: boolean = false) => {
    const exampleDomain = 'http://example.com/'
    let usedUrl = url
    if (!url.includes('http')) {
      usedUrl = exampleDomain + url
    }
    let _url = new URL(usedUrl);
    _url.searchParams.set('page_size', rowsPerPage.toString());
    _url.searchParams.set('page', currentPage.toString());
    if (searchTerm) {
      _url.searchParams.set('q', searchTerm);
    }

    const urlRequest = _url.toString().replace(exampleDomain, '')
    if (force || session !== urlRequest) {
      dispatch(action(urlRequest));
    }
    session = urlRequest
  }

  /** When create and edit is done, do request */
  useEffect(() => {
    if (session && !createLoading && !editLoading) {
      if (!createError && !editError) {
        request(true)
      }
    }
  }, [createLoading, editLoading]);

  /** When first dispatch created */
  useEffect(() => {
    request()
  }, [dispatch]);

  /** When first dispatch created */
  useEffect(() => {
    if (listData.total_page && currentPage >= 1 && currentPage <= listData.total_page) {
      request()
    }
  }, [currentPage]);

  /** When first dispatch created */
  useEffect(() => {
    setCurrentPage(1);
    lastSearchTerm = searchTerm;
    debouncedSearchTerm(searchTerm);
  }, [searchTerm]);

  const data = listData?.results
  return (
    <Box>
      <Box minHeight={{ base: 'auto', md: '80vh' }}>

        {/* Dashboard title */}
        <DashboardTitle title={title}/>

        {/* Top navigation of dashboard */}
        <TopNavigation
          onSearch={setSearchTerm} placeholder={searchPlaceholder}
          leftElement={leftNavigation}
          rightElement={rightNavigation}
        />

        <Box mt={4}>
          {
            error ? <Box color='red'>{error.toString()}</Box> :
              loading ?
                <Box
                  display={'flex'} justifyContent={'center'} width={'100%'}
                  height={'100%'} alignItems={'center'} paddingY={8}
                >
                  <Spinner size='xl'/>
                </Box> :
                <RenderContent data={data} renderCards={renderCards}/>
          }
        </Box>


      </Box>
      {/* Pagination */}
      <Flex justifyContent="center" mt={4}>
        <Pagination
          totalItems={listData.count}
          itemsPerPage={rowsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </Flex>
    </Box>
  );
};
