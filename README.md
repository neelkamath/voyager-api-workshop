# Voyager API Workshop

Demos [Voyager](https://voyager.online)'s REST API by generating a notification when new events associated with a
specified contract get generated on Goerli.

## Installation

1. Install [Node.js](https://nodejs.org/en/download).
2. Clone the repo using one of the following methods:
   - SSH: `git clone git@github.com:neelkamath/voyager-api-workshop.git`
   - HTTPS: `git clone https://github.com/neelkamath/voyager-api-workshop.git`
3. Change the directory:

    ```shell
    cd voyager-api-workshop
    ```
4. Install the dependencies:

    ```shell
    npm i
    ```
5. Edit the contract address used on line 78 of [`src/index.tsx`](src/index.tsx) to use your own wallet.

## Usage

1. Run the project:

    ```shell
    npm start
    ```
2. Open http://localhost:1234.
3. Click **Subscribe** and allow notifications.
4. Open the console to see the events printed.
5. Execute a transaction using the wallet you specified during installation to get a notification of such.
6. Once you're done, press control + C to exit.

## License

This project is under the [MIT License](LICENSE).
