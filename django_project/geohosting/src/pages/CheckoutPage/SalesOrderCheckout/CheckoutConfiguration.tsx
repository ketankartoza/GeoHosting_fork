import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  GridItem,
  Input,
  Text,
  useBreakpointValue
} from '@chakra-ui/react';
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../redux/store";
import {
  fetchSalesOrderDetail,
  SalesOrder
} from "../../../redux/reducers/salesOrdersSlice";
import OrderSummary from "../../CheckoutPage/OrderSummary";
import { toast } from "react-toastify";


interface Props {
  salesOrderDetail: SalesOrder | null;
}

const CheckoutConfiguration: React.FC<Props> = ({ salesOrderDetail }) => {
  const dispatch: AppDispatch = useDispatch();
  const columns = useBreakpointValue({ base: 1, md: 2 });
  const [appName, setAppName] = useState<string>('');
  const [disabled, setDisabled] = useState<boolean>(false);
  const { token } = useSelector((state: RootState) => state.auth);

  if (!salesOrderDetail) {
    return null
  }

  const submit = async () => {
    setDisabled(true)
    try {
      await axios.patch(`/api/orders/${id}/`, { app_name: appName }, {
        headers: { Authorization: `Token ${token}` }
      });
      if (id != null) {
        dispatch(fetchSalesOrderDetail(id));
      }
      // @ts-ignore
    } catch ({ message }) {
      toast.error("App name should just contains letter, number and dash");
      setDisabled(false)
    }
  };

  const id = salesOrderDetail.id
  return (
    <>
      <Grid gap={6} templateColumns={`repeat(${columns}, 1fr)`}>
        <OrderSummary
          product={salesOrderDetail.product}
          pkg={salesOrderDetail.package}
          invoice_url={salesOrderDetail.invoice_url}
        />
        <GridItem>
          <Box>
            <Text fontSize={22} color={'black'}>
              App name
            </Text>
          </Box>
          <Box padding={8} backgroundColor="gray.100" borderRadius={10}>
            <Input
              defaultValue={salesOrderDetail.app_name}
              backgroundColor="white"
              placeholder='Name just contains letter, number and dash'
              size='lg'
              isDisabled={disabled}
              onChange={(evt) => setAppName(evt.target.value)}
            />
            <Box>
              <Text
                fontSize={12} color={'gray'} fontStyle={"italic"}
                marginTop={'1rem'}>
                <i>
                  This will be used for subdomain and also application
                  name.
                  e.g: appname.geonode.kartoza.com
                </i>
              </Text>
            </Box>
          </Box>
        </GridItem>
      </Grid>

      <Box mt={4}>
        <Button
          w='100%'
          colorScheme="orange"
          isDisabled={!appName || disabled}
          onClick={() => {
            submit()
          }}
        >
          Save configuration and deploy
        </Button>
      </Box>
    </>
  );
};

export default CheckoutConfiguration;
