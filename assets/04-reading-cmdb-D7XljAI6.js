var e={id:`reading-cmdb`,h:{en:`Reading the firewall: cmdb, monitor, filter and format`,hi:`Firewall ko padhna: cmdb, monitor, filter aur format`},body:{en:`
<p>Before you change anything on a firewall you read it. Reading is safe, repeatable and the base of every later step: the "does it exist already?" check in chapter 5, the read-back in chapter 9, the evidence in a ticket. This chapter shows how to ask exactly the question you need and nothing more.</p>

<h3>An analogy: the library catalogue and the front desk</h3>
<p><code>cmdb</code> is the library catalogue: it lists every book that was <em>put on the shelf</em> (what an engineer configured). <code>monitor</code> is the front desk: it tells you who is in the building <em>right now</em> and how many times each book was borrowed. The catalogue can say a policy exists while the front desk says nobody ever used it.</p>

<h3>One script, five questions</h3>
<p><code>reads.py</code> uses the client from chapter 3 and asks seven small questions:</p>
<pre class="code">from fgt import FortiError, call, session

s = session()
rows = call(s, "GET", "/cmdb/firewall/address", params={"format": "name|subnet", "filter": "name=@web"})["results"]
print("filter name=@web:", [(r["name"], r["subnet"]) for r in rows])
rows = call(s, "GET", "/cmdb/firewall/address", params={"format": "name", "start": 0, "count": 2})["results"]
print("first two addresses:", [r["name"] for r in rows])
print("filter with no match:", call(s, "GET", "/cmdb/firewall/address", params={"filter": "name==ghost"})["results"])
try:
    call(s, "GET", "/cmdb/firewall/address/ghost")
except FortiError as err:
    print("one missing object:", err)
for p in call(s, "GET", "/monitor/firewall/policy")["results"]:
    print("policy", p["policyid"], "hit_count", p["hit_count"], "bytes", p["bytes"])
for i in call(s, "GET", "/monitor/system/interface")["results"].values():
    if i["ip"] != "0.0.0.0":
        print("interface", i["name"], i["ip"], "link", i["link"])</pre>
<pre class="out">AUTO01$ python3 reads.py
filter name=@web: [('web1', '10.20.0.10 255.255.255.255'), ('web2', '10.20.0.11 255.255.255.255')]
first two addresses: ['none', 'all']
filter with no match: []
<span class="hl">one missing object: GET /cmdb/firewall/address/ghost -&gt; status 404, FortiOS error -3</span>
<span class="hl">policy 1 hit_count 0 bytes 0</span>
<span class="hl">interface port1 10.99.0.41 link True</span>
<span class="hl">interface port2 10.20.0.1 link False</span></pre>
<p>Read it line by line:</p>
<ol>
<li><b>Filter.</b> <code>filter=name=@web</code> means "name contains web". Exact match is <code>name==web1</code>. Both worked in the lab. A real FortiOS documents more operators (not equal, not contains, greater or smaller); check the API documentation of your build before you use them.</li>
<li><b>Format.</b> <code>format=name|subnet</code> returns only those two fields. A full address object has a dozen fields; a full policy has fifty. Ask for what you need.</li>
<li><b>Paging.</b> <code>start=0&amp;count=2</code> returns the first two. The built-in objects <code>none</code> and <code>all</code> come first, which surprises people who expect an empty firewall.</li>
<li><b>No match on a collection</b> is not an error: status 200 and <code>results</code> is an empty list.</li>
<li><b>One object that does not exist</b> is an error: status 404, FortiOS error -3. The difference matters in code, and the next chapter builds on it.</li>
<li><b>Monitor, policy.</b> <code>/monitor/firewall/policy</code> gives <code>hit_count</code> and <code>bytes</code> per policy. Zero means no traffic has matched it yet.</li>
<li><b>Monitor, interfaces.</b> <code>/monitor/system/interface</code> returns a dictionary keyed by interface name, so the script loops over <code>.values()</code>. <code>port2</code> shows <code>link False</code>: the lab's inside port has no cable.</li>
</ol>
<p>The dictionary-versus-list point is worth a pause. <code>cmdb</code> tables come back as a <b>list</b> in <code>results</code>; some <code>monitor</code> endpoints come back as a <b>dictionary</b>. Print the raw reply once (chapter 3) before you write the loop.</p>

<h3>The same query in curl</h3>
<p>When a script returns something odd, run the same question by hand. In curl, quote the URL because of the <code>|</code> and <code>&amp;</code> characters:</p>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Bearer $FGT_TOKEN" "h&#116;tps://10.99.0.41/api/v2/cmdb/firewall/address?format=name|subnet&amp;filter=name==web1"
{
  "http_method":"GET",
<span class="hl">  "revision":"2540dff32640e1862740e3192840e4ac",</span>
  "results":[
    {
<span class="hl">      "name":"web1",</span>
<span class="hl">      "subnet":"10.20.0.10 255.255.255.255"</span>
    }
  ],
  "vdom":"root",
  "path":"firewall",
  "name":"address",
  "status":"success",
  "http_status":200,
  "serial":"FGVMEV5I0AL40000",
  "version":"v7.4.4",
  "build":2662
}</pre>
<p>Two things to notice. <code>revision</code> is a fingerprint of the whole configuration; it changes after every write, so it is a cheap way to see that something changed. And each object normally carries <code>q_origin_key</code>, the value you put in the URL to address that object (<code>/cmdb/firewall/address/web1</code>). It equals the name here, but for tables keyed by a number, such as policies, it is the number. Use the returned key rather than guessing.</p>

<div class="eg"><p><b>Worked example: has the new policy seen traffic?</b> Change CHG-3105 went in an hour ago. The requester says "it does not work". Before opening the policy, ask the front desk: <code>/monitor/firewall/policy</code> shows <code>policy 1 hit_count 0 bytes 0</code>. Nobody matched it. The cause is not the policy (the catalogue says it is right), but the path to it. Here the clue is on the next line of the same script: <code>interface port2 ... link False</code>. The inside port is down, so no packet arrives. A read-only script found the problem in two lines of output.</p></div>

<div class="note"><p><b>In the lab vs on real gear.</b> The lab FortiGate has a small configuration, so the lists are short. A real firewall has hundreds of default objects (services, addresses, certificates), and a full dump of a table can be many megabytes. Always combine <code>format</code>, <code>filter</code> and <code>count</code>. The lab runs a single virtual domain, <code>root</code>; a real firewall in multi-vdom mode also needs the <code>vdom</code> query parameter.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reading a whole table to look for one name. Treating an empty list as an error, or a 404 as "empty". Comparing the <code>subnet</code> string without allowing for a different spelling of the same value. Using <code>cmdb</code> to answer a live-state question.</p></div>
<div class="exam"><p><b>Exam trap.</b> Reading never needs a commit and never changes anything, but it still needs a key with at least read permission on the area. A key without access to <code>monitor</code> gets 403 on monitor URLs while cmdb URLs work. The next chapters show how to read that error.</p></div>

<div class="scn"><h4>The 404 that was not a failure</h4><p>A script asked for <code>/cmdb/firewall/address/web9</code> and crashed with "status 404, FortiOS error -3". The author thought the firewall was broken. It was answering correctly: web9 does not exist. A script that wants "create if missing" must treat that 404 as "go ahead and create", or use the filter query, which answers 200 with an empty list.</p><p><b>Lesson:</b> 404 on one object means "not there", and "not there" is often a valid answer.</p></div>

<div class="iv"><p class="q">"What is the difference between cmdb and monitor in the FortiOS API?"</p><p>cmdb is the configuration database, what an administrator set; it is read and written with GET, POST, PUT and DELETE. monitor is runtime state such as interface link, routing table, sessions and policy hit counts; it is mostly read-only. I use cmdb to check what was configured and monitor to check what is actually happening.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>cmdb = configured, monitor = live. Use both when you investigate.</li>
<li><code>filter</code> (== exact, =@ contains), <code>format</code> (field list with |), <code>start</code> and <code>count</code> keep answers small.</li>
<li>A collection with no match is 200 and an empty list; one missing object is 404 with error -3.</li>
<li>Use the returned <code>q_origin_key</code> to address an object; <code>revision</code> changes after each write.</li>
<li>Print the raw reply once to see if a monitor endpoint returns a list or a dictionary.</li>
</ul></div>
`,hi:`
<p>Firewall par kuch badalne se pehle aap use padhte ho. Padhna safe hai, repeat ho sakta hai, aur har agle step ki buniyaad hai: chapter 5 ka "kya yeh pehle se hai?" check, chapter 9 ka read-back, ticket ka saboot. Yeh chapter dikhata hai ki bilkul wahi sawal kaise poochho jo chahiye, usse zyada nahi.</p>

<h3>Ek analogy: library catalogue aur front desk</h3>
<p><code>cmdb</code> library catalogue hai: yeh un sab kitabon ki list hai jo <em>shelf par rakhi gayi</em> (jo engineer ne configure kiya). <code>monitor</code> front desk hai: yeh batata hai ki <em>abhi</em> building mein kaun hai aur har kitab kitni baar li gayi. Catalogue keh sakta hai ki policy maujood hai jabki front desk kehta hai ki use kabhi kisi ne use nahi kiya.</p>

<h3>Ek script, saat sawal</h3>
<p><code>reads.py</code> chapter 3 ka client use karti hai aur saat chhote sawal poochhti hai:</p>
<pre class="code">from fgt import FortiError, call, session

s = session()
rows = call(s, "GET", "/cmdb/firewall/address", params={"format": "name|subnet", "filter": "name=@web"})["results"]
print("filter name=@web:", [(r["name"], r["subnet"]) for r in rows])
rows = call(s, "GET", "/cmdb/firewall/address", params={"format": "name", "start": 0, "count": 2})["results"]
print("first two addresses:", [r["name"] for r in rows])
print("filter with no match:", call(s, "GET", "/cmdb/firewall/address", params={"filter": "name==ghost"})["results"])
try:
    call(s, "GET", "/cmdb/firewall/address/ghost")
except FortiError as err:
    print("one missing object:", err)
for p in call(s, "GET", "/monitor/firewall/policy")["results"]:
    print("policy", p["policyid"], "hit_count", p["hit_count"], "bytes", p["bytes"])
for i in call(s, "GET", "/monitor/system/interface")["results"].values():
    if i["ip"] != "0.0.0.0":
        print("interface", i["name"], i["ip"], "link", i["link"])</pre>
<pre class="out">AUTO01$ python3 reads.py
filter name=@web: [('web1', '10.20.0.10 255.255.255.255'), ('web2', '10.20.0.11 255.255.255.255')]
first two addresses: ['none', 'all']
filter with no match: []
<span class="hl">one missing object: GET /cmdb/firewall/address/ghost -&gt; status 404, FortiOS error -3</span>
<span class="hl">policy 1 hit_count 0 bytes 0</span>
<span class="hl">interface port1 10.99.0.41 link True</span>
<span class="hl">interface port2 10.20.0.1 link False</span></pre>
<p>Line by line padho:</p>
<ol>
<li><b>Filter.</b> <code>filter=name=@web</code> ka matlab "name mein web aata hai". Exact match <code>name==web1</code> hai. Lab mein dono chale. Asli FortiOS mein aur operators documented hain (not equal, not contains, bada ya chhota); use karne se pehle apne build ka API documentation dekho.</li>
<li><b>Format.</b> <code>format=name|subnet</code> sirf wahi do fields deta hai. Poore address object mein bees fields hote hain, policy mein pachaas. Jo chahiye wahi maango.</li>
<li><b>Paging.</b> <code>start=0&amp;count=2</code> pehle do deta hai. Built-in objects <code>none</code> aur <code>all</code> sabse pehle aate hain, jo unhe chaukata hai jo khaali firewall expect karte hain.</li>
<li><b>Collection mein koi match nahi</b> error nahi hai: status 200 aur <code>results</code> khaali list.</li>
<li><b>Ek object jo hai hi nahi</b> error hai: status 404, FortiOS error -3. Code mein yeh farq maayne rakhta hai, aur agla chapter isi par bana hai.</li>
<li><b>Monitor, policy.</b> <code>/monitor/firewall/policy</code> har policy ka <code>hit_count</code> aur <code>bytes</code> deta hai. Zero ka matlab abhi tak koi traffic match nahi hua.</li>
<li><b>Monitor, interfaces.</b> <code>/monitor/system/interface</code> interface ke naam se dictionary deta hai, isliye script <code>.values()</code> par loop karti hai. <code>port2</code> par <code>link False</code> hai: lab ke inside port mein cable nahi hai.</li>
</ol>
<p>Dictionary versus list wali baat par ruko. <code>cmdb</code> tables <code>results</code> mein <b>list</b> ki tarah aati hain; kuch <code>monitor</code> endpoints <b>dictionary</b> ki tarah. Loop likhne se pehle raw reply ek baar print karo (chapter 3).</p>

<h3>Wahi query curl mein</h3>
<p>Jab script kuch ajeeb de, wahi sawal haath se chalao. Curl mein URL ko quote karo kyunki <code>|</code> aur <code>&amp;</code> characters hain:</p>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Bearer $FGT_TOKEN" "h&#116;tps://10.99.0.41/api/v2/cmdb/firewall/address?format=name|subnet&amp;filter=name==web1"
{
  "http_method":"GET",
<span class="hl">  "revision":"2540dff32640e1862740e3192840e4ac",</span>
  "results":[
    {
<span class="hl">      "name":"web1",</span>
<span class="hl">      "subnet":"10.20.0.10 255.255.255.255"</span>
    }
  ],
  "vdom":"root",
  "path":"firewall",
  "name":"address",
  "status":"success",
  "http_status":200,
  "serial":"FGVMEV5I0AL40000",
  "version":"v7.4.4",
  "build":2662
}</pre>
<p>Do cheezein dekho. <code>revision</code> poori configuration ka fingerprint hai; har write ke baad badalta hai, isliye yeh dekhne ka sasta tareeka hai ki kuch badla. Aur har object aam taur par <code>q_origin_key</code> rakhta hai, jo woh value hai jo aap URL mein us object ko address karne ke liye daalte ho (<code>/cmdb/firewall/address/web1</code>). Yahan yeh name ke barabar hai, par number se key hone wali tables mein, jaise policies, yeh number hota hai. Anuman lagane ki jagah returned key use karo.</p>

<div class="eg"><p><b>Worked example: kya nayi policy ne traffic dekha?</b> Change CHG-3105 ek ghante pehle gaya. Requester kehta hai "chal nahi raha". Policy kholne se pehle front desk se poocho: <code>/monitor/firewall/policy</code> dikhata hai <code>policy 1 hit_count 0 bytes 0</code>. Kisi ne match nahi kiya. Wajah policy nahi hai (catalogue kehta hai sahi hai), balki uska raasta hai. Clue usi script ki agli line mein hai: <code>interface port2 ... link False</code>. Inside port down hai, isliye koi packet aata hi nahi. Read-only script ne do line ke output mein problem pakad li.</p></div>

<div class="note"><p><b>Lab vs asli gear.</b> Lab FortiGate ki configuration chhoti hai, isliye lists chhoti hain. Asli firewall mein sainkdon default objects (services, addresses, certificates) hote hain, aur ek table ka poora dump kai megabytes ka ho sakta hai. Hamesha <code>format</code>, <code>filter</code> aur <code>count</code> saath use karo. Lab ek hi virtual domain, <code>root</code>, chalata hai; multi-vdom mode ke asli firewall mein <code>vdom</code> query parameter bhi chahiye.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Ek naam dhoondhne ke liye poori table padhna. Khaali list ko error samajhna, ya 404 ko "khaali". Ek hi value ki alag spelling ka dhyan rakhe bina <code>subnet</code> string compare karna. Live-state ke sawal ka jawab <code>cmdb</code> se dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Padhne ke liye commit nahi chahiye aur kuch badalta nahi, par us area par kam se kam read permission wali key phir bhi chahiye. Jis key ka <code>monitor</code> par access nahi, use monitor URLs par 403 milta hai jabki cmdb URLs chalte hain. Agle chapters dikhate hain ki yeh error kaise padhna hai.</p></div>

<div class="scn"><h4>Woh 404 jo failure nahi tha</h4><p>Ek script ne <code>/cmdb/firewall/address/web9</code> maanga aur "status 404, FortiOS error -3" ke saath crash hui. Author ne socha firewall kharab hai. Woh sahi jawab de raha tha: web9 hai hi nahi. "Na ho to bana do" chahne wali script ko us 404 ko "aage badho aur bana do" samajhna chahiye, ya filter query use karni chahiye, jo 200 aur khaali list se jawab deti hai.</p><p><b>Lesson:</b> ek object par 404 ka matlab "wahan nahi hai", aur "nahi hai" aksar sahi jawab hota hai.</p></div>

<div class="iv"><p class="q">"FortiOS API mein cmdb aur monitor mein kya farq hai?"</p><p>cmdb configuration database hai, jo administrator ne set kiya; use GET, POST, PUT aur DELETE se padha aur likha jaata hai. monitor runtime state hai jaise interface link, routing table, sessions aur policy hit counts; yeh zyadatar read-only hai. Kya configure hua dekhne ke liye cmdb, aur asal mein kya ho raha hai dekhne ke liye monitor use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>cmdb = configured, monitor = live. Investigation mein dono use karo.</li>
<li><code>filter</code> (== exact, =@ contains), <code>format</code> (| se field list), <code>start</code> aur <code>count</code> jawab chhote rakhte hain.</li>
<li>Collection mein koi match nahi to 200 aur khaali list; ek missing object par 404 aur error -3.</li>
<li>Object address karne ke liye returned <code>q_origin_key</code> use karo; <code>revision</code> har write ke baad badalta hai.</li>
<li>Raw reply ek baar print karo, taaki pata chale monitor endpoint list deta hai ya dictionary.</li>
</ul></div>
`}};export{e as default};