var e={id:`rest-and-json-refresher`,h:{en:`REST and JSON refresher: why APIs beat clicking`,hi:`REST aur JSON refresher: APIs clicking se behtar kyun`},body:{en:`
<h3>What you will learn</h3>
<ul>
<li>What an API is, and what REST means in plain words.</li>
<li>HTTP methods (GET, POST, PUT, DELETE), status codes and headers.</li>
<li>What JSON is and how to read it.</li>
<li>Why automating the dashboard with code beats clicking for 3 cities or 300 branches.</li>
</ul>
<p><b>Prerequisites:</b> the earlier modules of this track and a first look at Python (variables, lists, dictionaries, loops). If you have done the Python requests module of the automation track, this chapter is a quick refresher. A complete beginner can still follow: every term is explained.</p>

<h3>The big picture: ordering at a restaurant</h3>
<p>In a restaurant you do not walk into the kitchen. You tell the waiter what you want using a menu, and the waiter brings the dish. An <b>API</b> (Application Programming Interface) is the waiter: a defined way for a program to ask another system to do something. The dashboard has two doors: the web pages you click, and the <b>Dashboard API</b> that code can call. Both reach the same system.</p>
<p><b>REST</b> is a common style for such APIs. Everything is a <b>resource</b> with an address (a path), such as the list of networks of an organization. You use a standard <b>method</b> to act on it, and the answer comes back with a <b>status code</b> and usually a <b>JSON</b> body. In this track the API is modelled on the common REST style with our own paths; check the vendor documentation for a real product.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Request and response between script and dashboard">
<rect x="20" y="40" width="150" height="70" rx="10" fill="#bae6fd"/><text x="95" y="70" text-anchor="middle" class="svg-ink" font-size="13">Your Python</text><text x="95" y="90" text-anchor="middle" class="svg-muted" font-size="12">requests</text>
<rect x="470" y="40" width="150" height="70" rx="10" fill="#bbf7d0"/><text x="545" y="70" text-anchor="middle" class="svg-ink" font-size="13">Dashboard API</text><text x="545" y="90" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.80</text>
<line x1="170" y1="62" x2="470" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="470,62 460,57 460,67" fill="#64748b"/>
<line x1="470" y1="90" x2="170" y2="90" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><polygon points="170,90 180,85 180,95" fill="#64748b"/>
<text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="12">request: method + path + headers (+ JSON body)</text>
<text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="12">response: status code + headers + JSON</text>
<rect x="20" y="145" width="600" height="45" rx="8" fill="#fde68a"/><text x="320" y="173" text-anchor="middle" class="svg-ink" font-size="13">One request, one response. The status code tells you if it worked.</text>
</svg><p class="cap">The request and response cycle.</p></div>

<h3>HTTP methods</h3>
<table class="cmp"><tr><th>Method</th><th>Meaning</th><th>Dashboard example</th></tr>
<tr><td>GET</td><td>Read, change nothing</td><td>List networks</td></tr>
<tr><td>POST</td><td>Create something new</td><td>Create a VLAN</td></tr>
<tr><td>PUT</td><td>Update (replace the given settings)</td><td>Change a firewall rule list</td></tr>
<tr><td>DELETE</td><td>Remove</td><td>Remove a VLAN</td></tr></table>

<h3>Status codes</h3>
<p>The first digit gives the family: <b>2xx</b> success (200 OK, 201 Created), <b>4xx</b> your request has a problem (400 bad body, 401 not authenticated, 403 not allowed, 404 not found, 409 conflict), <b>5xx</b> the server has a problem. Chapter 4 explains the 4xx codes of our lab.</p>

<h3>Headers and JSON</h3>
<p><b>Headers</b> are labelled extra information with a request or response, such as <code>Authorization</code> (who you are) and <code>Content-Type</code> (the format of the body). <b>JSON</b> (JavaScript Object Notation) is the text format for data: objects in curly braces with key and value pairs, lists in square brackets, strings in double quotes. Python turns JSON into dictionaries and lists, which you already know.</p>
<pre class="out">[
  {
    "id": "1001",
    "name": "Bharat Retail Co"
  }
]</pre>
<p>This is a list with one object. The object has two keys, <code>id</code> and <code>name</code>. In Python, after <code>data = response.json()</code>, <code>data[0]["name"]</code> is <code>"Bharat Retail Co"</code>.</p>

<h3>Why code beats clicking</h3>
<ul>
<li><b>Speed:</b> checking 3 networks by clicking takes minutes; a script takes a second. With 300 branches clicking is not realistic.</li>
<li><b>Consistency:</b> a script applies the same change the same way everywhere, with no typos from tired fingers.</li>
<li><b>Records:</b> a script can write a report or a backup file.</li>
<li><b>Repeatability:</b> run it again next month.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> The auditor asks: "List every VLAN in every Bharat Retail Co network." Clicking: 3 networks, open Addressing and VLANs three times, copy values. Script: one loop prints the same list in under a second and saves it to a file. Next quarter the same script runs against 30 networks with no extra effort.</p></div>

<div class="note"><p><b>What does this change on the wire/policy?</b> A GET changes nothing. POST and PUT change real configuration. In this track, API changes apply <b>immediately</b>, with no candidate or Save step, so treat every write with care. You will learn habits to stay safe in chapters 4 and 5.</p></div>
<div class="warn"><p><b>Common mistakes.</b> Forgetting that APIs return text that you must convert to data (<code>.json()</code>); mixing up PUT and POST; ignoring the status code and reading a failure as data; testing a write on a live network first.</p></div>
<div class="exam"><p><b>Exam trap.</b> 2xx means success, 4xx means a client problem, 5xx a server problem. A 404 means the path or id is wrong; it does not mean the server is down.</p></div>

<div class="scn"><h4>The quarterly audit</h4><p>Every quarter an engineer spent half a day opening dashboard pages to list VLANs and SSIDs for auditors. After writing a short Python script that called the Dashboard API, the same report took five seconds and was identical every time. The audit team started to ask for it themselves.</p><p><b>Lesson:</b> repeatable reports are the first and safest use of an API.</p></div>

<div class="iv"><p class="q">"What is REST and what are the main HTTP methods?"</p><p>Strong answer: REST is a style where resources have addresses and you act on them with standard methods: GET reads, POST creates, PUT updates, DELETE removes. Responses carry a status code and often JSON. Mention that 2xx is success and 4xx is a client-side problem.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An API lets code do what you do by clicking.</li>
<li>REST: resources with paths, standard methods, status codes and JSON.</li>
<li>GET reads, POST creates, PUT updates, DELETE removes.</li>
<li>Status families: 2xx success, 4xx your problem, 5xx server problem.</li>
<li>Python reads JSON as dictionaries and lists; API writes apply immediately here.</li>
</ul></div>
`,hi:`
<h3>What you will learn</h3>
<ul>
<li>API kya hai, aur REST ka matlab simple words mein.</li>
<li>HTTP methods (GET, POST, PUT, DELETE), status codes aur headers.</li>
<li>JSON kya hai aur use kaise padhte hain.</li>
<li>3 cities ya 300 branches ke liye dashboard ko code se automate karna clicking se behtar kyun hai.</li>
</ul>
<p><b>Prerequisites:</b> is track ke pichhle modules aur Python ki pehli jhalak (variables, lists, dictionaries, loops). Agar aapne automation track ka Python requests module kiya hai to yeh chapter quick refresher hai. Bilkul beginner bhi follow kar sakta hai: har term samjhaya gaya hai.</p>

<h3>Big picture: restaurant mein order dena</h3>
<p>Restaurant mein aap kitchen mein nahi ghuste. Aap menu se waiter ko batate ho ki kya chahiye, aur waiter dish laata hai. <b>API</b> (Application Programming Interface) waiter hai: ek defined tareeka jisse program kisi doosre system se kuch karwata hai. Dashboard ke do darwaze hain: web pages jinhe aap click karte ho, aur <b>Dashboard API</b> jise code call kar sakta hai. Dono ek hi system tak pahunchte hain.</p>
<p><b>REST</b> aise APIs ka ek common style hai. Har cheez ek <b>resource</b> hai jiska address (path) hota hai, jaise organization ke networks ki list. Aap us par kaam karne ke liye standard <b>method</b> use karte ho, aur jawab <b>status code</b> aur aam taur par <b>JSON</b> body ke saath aata hai. Is track mein API common REST style par model hai aur paths humare apne hain; real product ke liye vendor documentation check karo.</p>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Script aur dashboard ke beech request aur response">
<rect x="20" y="40" width="150" height="70" rx="10" fill="#bae6fd"/><text x="95" y="70" text-anchor="middle" class="svg-ink" font-size="13">Aapka Python</text><text x="95" y="90" text-anchor="middle" class="svg-muted" font-size="12">requests</text>
<rect x="470" y="40" width="150" height="70" rx="10" fill="#bbf7d0"/><text x="545" y="70" text-anchor="middle" class="svg-ink" font-size="13">Dashboard API</text><text x="545" y="90" text-anchor="middle" class="svg-muted" font-size="12">203.0.113.80</text>
<line x1="170" y1="62" x2="470" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="470,62 460,57 460,67" fill="#64748b"/>
<line x1="470" y1="90" x2="170" y2="90" stroke="#64748b" stroke-width="2" stroke-dasharray="5 4"/><polygon points="170,90 180,85 180,95" fill="#64748b"/>
<text x="320" y="55" text-anchor="middle" class="svg-ink" font-size="12">request: method + path + headers (+ JSON body)</text>
<text x="320" y="110" text-anchor="middle" class="svg-ink" font-size="12">response: status code + headers + JSON</text>
<rect x="20" y="145" width="600" height="45" rx="8" fill="#fde68a"/><text x="320" y="173" text-anchor="middle" class="svg-ink" font-size="13">Ek request, ek response. Status code batata hai kaam hua ya nahi.</text>
</svg><p class="cap">Request aur response ka cycle.</p></div>

<h3>HTTP methods</h3>
<table class="cmp"><tr><th>Method</th><th>Matlab</th><th>Dashboard example</th></tr>
<tr><td>GET</td><td>Padho, kuch na badlo</td><td>Networks ki list</td></tr>
<tr><td>POST</td><td>Kuch naya banao</td><td>VLAN create karo</td></tr>
<tr><td>PUT</td><td>Update (di gayi settings replace)</td><td>Firewall rule list badlo</td></tr>
<tr><td>DELETE</td><td>Hatao</td><td>VLAN hatao</td></tr></table>

<h3>Status codes</h3>
<p>Pehla digit family batata hai: <b>2xx</b> success (200 OK, 201 Created), <b>4xx</b> aapki request mein problem (400 bad body, 401 not authenticated, 403 not allowed, 404 not found, 409 conflict), <b>5xx</b> server ki problem. Chapter 4 humare lab ke 4xx codes samjhata hai.</p>

<h3>Headers aur JSON</h3>
<p><b>Headers</b> request ya response ke saath labelled extra information hain, jaise <code>Authorization</code> (aap kaun ho) aur <code>Content-Type</code> (body ka format). <b>JSON</b> (JavaScript Object Notation) data ka text format hai: curly braces mein key aur value pairs wale objects, square brackets mein lists, double quotes mein strings. Python JSON ko dictionaries aur lists mein badal deta hai, jo aap pehle se jaante ho.</p>
<pre class="out">[
  {
    "id": "1001",
    "name": "Bharat Retail Co"
  }
]</pre>
<p>Yeh ek object wali list hai. Object ki do keys hain, <code>id</code> aur <code>name</code>. Python mein <code>data = response.json()</code> ke baad <code>data[0]["name"]</code> hai <code>"Bharat Retail Co"</code>.</p>

<h3>Code clicking se behtar kyun</h3>
<ul>
<li><b>Speed:</b> 3 networks clicking se check karne mein minutes lagte hain; script mein ek second. 300 branches ke saath clicking realistic nahi.</li>
<li><b>Consistency:</b> script har jagah wahi change wahi tareeke se lagata hai, thake haathon ki typos ke bina.</li>
<li><b>Records:</b> script report ya backup file likh sakta hai.</li>
<li><b>Repeatability:</b> agle mahine phir chalao.</li>
</ul>
<div class="eg"><p><b>Worked example.</b> Auditor poochta hai: "Bharat Retail Co ke har network ke har VLAN ki list do." Clicking: 3 networks, Addressing and VLANs teen baar kholo, values copy karo. Script: ek loop wahi list ek second se kam mein print karta hai aur file mein save karta hai. Agli quarter wahi script 30 networks par bina extra mehnat ke chalta hai.</p></div>

<div class="note"><p><b>Wire/policy par kya badalta hai?</b> GET kuch nahi badalta. POST aur PUT asli configuration badalte hain. Is track mein API changes <b>turant</b> apply hote hain, candidate ya Save step ke bina, isliye har write ko dhyan se lo. Safe rehne ki aadatein chapters 4 aur 5 mein seekhoge.</p></div>
<div class="warn"><p><b>Common galtiyan.</b> Yeh bhool jaana ki API text deta hai jise data mein badalna padta hai (<code>.json()</code>); PUT aur POST mix karna; status code ignore karke failure ko data padhna; live network par pehle write test karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> 2xx success, 4xx client problem, 5xx server problem. 404 ka matlab path ya id galat hai; yeh nahi ki server down hai.</p></div>

<div class="scn"><h4>Quarterly audit</h4><p>Har quarter ek engineer aadha din dashboard pages khol kar auditors ke liye VLANs aur SSIDs ki list banata tha. Dashboard API call karne wali chhoti Python script likhne ke baad wahi report paanch second mein bani aur har baar identical thi. Audit team ne khud maangna shuru kar diya.</p><p><b>Seekh:</b> repeatable reports API ka pehla aur sabse safe use hain.</p></div>

<div class="iv"><p class="q">"REST kya hai aur main HTTP methods kaun si hain?"</p><p>Strong answer: REST ek style hai jahan resources ke addresses hote hain aur aap standard methods se un par kaam karte ho: GET padhta hai, POST banata hai, PUT update karta hai, DELETE hatata hai. Responses mein status code aur aksar JSON hota hai. Batao ki 2xx success hai aur 4xx client-side problem.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>API code ko woh karne deta hai jo aap clicking se karte ho.</li>
<li>REST: paths wale resources, standard methods, status codes aur JSON.</li>
<li>GET padhta hai, POST banata hai, PUT update karta hai, DELETE hatata hai.</li>
<li>Status families: 2xx success, 4xx aapki problem, 5xx server problem.</li>
<li>Python JSON ko dictionaries aur lists ki tarah padhta hai; yahan API writes turant apply hote hain.</li>
</ul></div>
`}};export{e as default};