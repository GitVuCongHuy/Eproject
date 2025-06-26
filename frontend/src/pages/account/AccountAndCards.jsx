import React from 'react';

import {  Box,  Typography,  Card,  CardContent,  Button,  Avatar,} from '@mui/material';
import {  CreditCard,  ChevronRight} from '@mui/icons-material';
import './AccountAndCard.css'; // Assuming you have a CSS file for styles

const AccountAndCards = () => {
  return (
    <Box className="account-and-cards-container">
      <Typography variant="h4" className="card-type-heading">
        Tài khoản & Thẻ
      </Typography>

      <Card className="card-section">
        <CardContent>
          <Box className="section-header">
            <Typography variant="h6">Tài khoản thanh toán</Typography>
            <Button size="small" endIcon={<ChevronRight fontSize="small" />}>
              Xem tất cả
            </Button>
          </Box>

          <Card variant="outlined">
            <CardContent>
              <Box className="account-card-content-box">
                <Box className="account-info-box">
                  <Avatar className="account-avatar">
                    <CreditCard />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>Tài khoản thanh toán</Typography>
                    <Typography variant="body2" className="account-number-text">
                      1907 1933 0300 17
                    </Typography>
                  </Box>
                </Box>
                <Box textAlign="right">
                  <Typography variant="caption">VND</Typography>
                  <Typography variant="h6" className="amount-text">95,245</Typography>
                  <ChevronRight fontSize="small" />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* You can add more card types here, e.g., Credit Cards, Debit Cards */}
      <Typography variant="h5" className="card-type-heading">
        Thẻ tín dụng
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            (Nội dung về thẻ tín dụng sẽ được thêm vào đây)
          </Typography>
        </CardContent>
      </Card>

      <Typography variant="h5" className="card-type-heading">
        Thẻ ghi nợ
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="body1">
            (Nội dung về thẻ ghi nợ sẽ được thêm vào đây)
          </Typography>
        </CardContent>
      </Card>

    </Box>
  );
};

export default AccountAndCards;

