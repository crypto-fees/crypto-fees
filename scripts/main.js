function makeRequest(url, callback) {
	httpRequest = new XMLHttpRequest();

	if (!httpRequest) {
		console.error('Cannot create an XMLHTTP instance');
		return;
	}

	httpRequest.onreadystatechange = function() {
		if (httpRequest.readyState === XMLHttpRequest.DONE) {
			if (httpRequest.status === 200) {
				var rawData = httpRequest.responseText;
				var data = JSON.parse(rawData);
				callback(data);
			} else {
				console.error('There was a problem with the request.');
			}
		}
	};

	httpRequest.open('GET', url);
	httpRequest.send();
}

var tickers = ['btc', /*'eth', 'ltc'*/]

var coingeckoIds = {
	btc: 'bitcoin',
	eth: 'ethereum',
	ltc: 'litecoin',
}

makeRequest('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin&vs_currencies=usd', function (data) {
	tickers.forEach(function(ticker) {
		var price = data[coingeckoIds[ticker]].usd;
		console.log(ticker + 'price =', price);

		makeRequest('https://api.blockcypher.com/v1/' + ticker + '/main', function(data) {
			var blockHeight = data.height;
			console.log(ticker + 'blockHeight =', blockHeight);

			makeRequest('https://api.blockcypher.com/v1/' + ticker + '/main/blocks/' + blockHeight, function(data) {
				var txIds = data.txids;
				console.log(ticker + 'txIds =', txIds);
				var txIdFirst = txIds[0]; // coinbase tx, fee = 0
				var txIdLast = txIds[txIds.length - 1];

				makeRequest('https://api.blockcypher.com/v1/' + ticker + '/main/txs/' + txIdLast, function(data) {
					console.log(data);
					var exampleFeeSat = data.fees;
					var exampleTxSize = data.size;
					var feeSatPerByte = exampleFeeSat / exampleTxSize;
					var btcTxSize = 250;
					var feeSat = feeSatPerByte * btcTxSize;
					console.log(ticker + 'fee = ', feeSat);
					
					var feeUsd = feeSat * 1e-8 * price;
					console.log('feeUsd = ', feeUsd);
					document.getElementsByClassName(ticker + ' fee value')[0].innerText = feeUsd.toFixed(2);
				})
			})
		})
	})
})

