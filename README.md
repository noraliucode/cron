# CryptoPatronage Payment System
<p align="center">
<img width="100" alt="image" src="https://github.com/noraliucode/cron/assets/12429503/c60bd905-7164-4099-908b-832e8ef3c81c">
</p>

CryptoPatronage Payment System is a utility that automates the execution of tasks related to
[CryptoPatronage](https://patronage.shokunin.network). It uses a cron job to perform these tasks at specific intervals. This repository contains the source code for this utility.

## Overview

This utility primarily performs two tasks:

1. **executeAnnouncedCalls**: This function is responsible for executing announced calls for delay transfer on the Polkadot network.

2. **transferPayment**: This function makes transactions that are registered in the payment system. This allows creators to receive their payments automatically every 5th of the month, eliminating the need for manual withdrawal.

The utility uses the Next.js framework for easier integration with Vercel, allowing for efficient deployment and scheduling of cron jobs.

## Setup

### Clone and Deploy 

Clone the repository and deploy it manually:

1. Clone the repository to your local machine using the command:

```
git clone https://github.com/noraliucode/cron.git
```

2. Install the dependencies:
```
yarn 
```

3. Run Next.js in development mode:
```
yarn dev
```

4. Deploy it to the cloud with Vercel. You can refer to the [Vercel Documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details​1​.

### Usage
Once the utility is set up and running, it will automatically perform the `executeAnnouncedCalls` and `transferPayment` tasks at the designated intervals. The `executeAnnouncedCalls` function runs on a daily basis, scanning for any matching calls that need to be executed. While the delay parameter is set up in the Polkadot network, this function ensures that the necessary actions are carried out each day. While the `transferPayment` function is triggered automatically every 5th of the month.

