fetch('data.json').then(res => res.json()).then(function(docsArr) {
	var docList = $$('#docList')[0];
	var docTemp = $$('#docTemp')[0].content;

	var urlEl = docTemp.querySelector('a');
	var descEl = docTemp.querySelector('span');
	var exampleEl = docTemp.querySelector('pre');

	docsArr.forEach(function(doc) {
		urlEl.textContent = doc.url;
		urlEl.href = 'https://suntrolley.herokuapp.com' + doc.url;
		urlEl.target = '_blank';
		descEl.textContent = doc.description;
		docList.appendChild(docTemp.cloneNode(true));
	});

	var examplesData = docsArr.map(function(doc) {
		return fetch('https://suntrolley.herokuapp.com' + doc.url).then(res => res.json());
	});

	Promise.all(examplesData).then(function(examples) {
		var $examples = $$('pre');
		examples.forEach(function(example, index) {
			$examples[index].textContent = JSON.stringify(example, null, 2);
		});
	});
});