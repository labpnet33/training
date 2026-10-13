var e={id:`writes-errors`,h:{en:`Writing to NetBox: create, update, delete and every error`,hi:`NetBox mein likhna: create, update, delete aur har error`},body:{en:`
<p>Reading is forgiving. Writing is not. A read that returns the wrong thing wastes a minute; a write that goes wrong changes the source of truth that every other script trusts. That is why NetBox answers a bad write with a clear, specific error, and why your scripts should read those errors instead of swallowing them.</p>

<h3>The four verbs</h3>
<table class="cmp"><tr><th>Verb</th><th>Meaning</th><th>pynetbox</th><th>Success</th></tr>
<tr><td>POST</td><td>create</td><td><code>endpoint.create(...)</code></td><td>201</td></tr>
<tr><td>PATCH</td><td>change some fields</td><td><code>endpoint.update([{"id": 7, ...}])</code></td><td>200</td></tr>
<tr><td>PUT</td><td>replace all fields</td><td>rarely needed</td><td>200</td></tr>
<tr><td>DELETE</td><td>remove</td><td><code>record.delete()</code> or <code>endpoint.delete([...])</code></td><td>204</td></tr></table>
<p>Use PATCH, not PUT, so that you only name what changes. Notice that <code>update</code> takes a <i>list</i> of dictionaries, each with an <code>id</code>: that is the bulk form, and it is how every script in this module writes.</p>

<h3>Bulk writes are all-or-nothing</h3>
<p>Give <code>create</code> or <code>update</code> a list and NetBox does it in one request, inside one database transaction. If any item is bad, none is saved.</p>
<pre class="code">import pynetbox

from nbconn import api

nb = api()
before = nb.ipam.vlans.count()
made = nb.ipam.vlans.create([{"vid": 110, "name": "LAB-A"}, {"vid": 120, "name": "LAB-B"}])
print("created in one call:", [(v.vid, v.name) for v in made], "| total", nb.ipam.vlans.count())

try:
    nb.ipam.vlans.create([{"vid": 130, "name": "LAB-C"}, {"vid": 5000, "name": "LAB-BAD"}])
except pynetbox.RequestError as err:
    print("one bad item:", err.req.status_code, err.error)
print("after the failed bulk call, total is still", nb.ipam.vlans.count())

nb.ipam.vlans.update([{"id": v.id, "description": "lab vlan"} for v in made])
print("descriptions:", [nb.ipam.vlans.get(v.id).description for v in made])

one = nb.ipam.vlans.get(made[0].id)
print("delete one record:", one.delete())
print("delete the rest:", nb.ipam.vlans.delete([made[1]]))
print("back to", nb.ipam.vlans.count(), "vlans, started with", before)</pre>
<pre class="out">AUTO01$ python3 bulk.py
created in one call: [(110, 'LAB-A'), (120, 'LAB-B')] | total 8
<span class="hl">one bad item: 400 [{},{"vid":["Ensure this value is less than or equal to 4094."]}]</span>
after the failed bulk call, total is still 8
descriptions: ['lab vlan', 'lab vlan']
delete one record: True
delete the rest: True
back to 6 vlans, started with 6</pre>
<p>The reply to a bad bulk call is a list with one entry per item: an empty object <code>{}</code> for an item that was fine and the error for the one that was not. Here the first VLAN was valid, yet "total is still 8" shows that it was not kept. That is what <b>atomic</b> means, and it is a gift when you push 200 changes: you never end in a half-applied state.</p>
<pre class="out">AUTO01$ curl -sk -X PATCH -H "Authorization: Token $NETBOX_TOKEN" -H "Content-Type: application/json" -d '[{"id":1,"description":"a"},{"id":2,"status":"bogus"}]' $NETBOX_URL/api/dcim/sites/
[{},{"status":[""bogus" is not a valid choice."]}]</pre>

<h3>Every error, side by side</h3>
<p>The script <code>errors.py</code> triggers a failure of each kind and prints what pynetbox says. The 400 family is the one you meet most, because the body names the field.</p>
<pre class="out">AUTO01$ python3 errors.py
missing slug -&gt; RequestError 400 | The request failed with code 400 Bad Request: {'slug': ['This field is required.']}
duplicate -&gt; RequestError 400 | The request failed with code 400 Bad Request: {'name': ['site with this name already exists.'], 'slug': ['site with this slug already exists.']}
bad choice -&gt; RequestError 400 | The request failed with code 400 Bad Request: {'status': ['"live" is not a valid choice.']}
bad foreign key -&gt; RequestError 400 | The request failed with code 400 Bad Request: {'device_type': ['Related object not found using the provided numeric ID: 99']}
bad address -&gt; RequestError 400 | The request failed with code 400 Bad Request: {'address': ['Invalid IP address format: 10.1.1.256/24']}
duplicate address -&gt; RequestError 400 | The request failed with code 400 Bad Request: {'address': ['Duplicate IP address found in global table: 10.99.0.1/24']}
vlan out of range -&gt; RequestError 400 | The request failed with code 400 Bad Request: {'vid': ['Ensure this value is less than or equal to 4094.']}
protected delete -&gt; RequestError 409 | The request failed with code 409 Conflict: {'detail': 'Unable to delete object. 5 dependent objects were found: PUN-R01 (1), PUN-CORE-R1 (1), PUN-CORE-R3 (2), PUN-DIST-SW1 ...
get matches two -&gt; ValueError | get() returned more than one result. Check that the kwarg(s) passed are valid for this endpoint or use filter() or all() instead.
filter without kwargs -&gt; ValueError | filter must be passed kwargs. Perhaps use all() instead.
unknown id -&gt; None
prefix is full -&gt; AllocationError | The requested allocation could not be fulfilled.
wrong token -&gt; RequestError 403 | The request failed with code 403 Forbidden: {'detail': 'Invalid token'}
no token -&gt; RequestError 403 | The request failed with code 403 Forbidden: {'detail': 'Authentication credentials were not provided.'}
no such host -&gt; Timeout | HTTPSConnectionPool(host='10.99.0.99', port=443): Max retries exceeded with url: /api/status/
plain h&#116;tp on 443 -&gt; ConnectionError | HTTPConnectionPool(host='10.99.0.80', port=80): Max retries exceeded with url: /api/status/
wrong port -&gt; ConnectionError | HTTPSConnectionPool(host='10.99.0.80', port=8443): Max retries exceeded with url: /api/status/</pre>
<table class="cmp"><tr><th>Status</th><th>Meaning</th><th>What to do</th></tr>
<tr><td>400</td><td>the data is wrong; the body names the field</td><td>fix the data, do not retry</td></tr>
<tr><td>403</td><td>no token, wrong token, or the token may only read</td><td>fix the credential</td></tr>
<tr><td>404</td><td>that id or URL does not exist</td><td>check the id; a <code>get()</code> returns None instead</td></tr>
<tr><td>409</td><td>delete refused: other objects depend on this one</td><td>remove or move the dependants first</td></tr>
<tr><td>502 / 5xx</td><td>NetBox itself or the proxy in front of it is down</td><td>tell the platform team, then retry later</td></tr></table>
<p>Look at the non-HT&#84;P errors too. A wrong host gives a <code>Timeout</code>, a wrong port or plain-text on the TLS port gives <code>ConnectionError</code>, and neither ever reaches NetBox, so there is no JSON to read. The ValueErrors come from pynetbox itself, before any request is sent.</p>
<pre class="out">AUTO01$ curl -sk -X POST -H "Authorization: Token $NETBOX_TOKEN" -H "Content-Type: application/json" -d '{"name":"Goa"}' $NETBOX_URL/api/dcim/sites/
{"slug":["This field is required."]}</pre>
<pre class="out">AUTO01$ curl -sk -X DELETE -H "Authorization: Token $NETBOX_TOKEN" $NETBOX_URL/api/dcim/sites/1/
{"detail":"Unable to delete object. 5 dependent objects were found: PUN-R01 (1), PUN-CORE-R1 (1), PUN-CORE-R3 (2), PUN-DIST-SW1 (3), PUN-ACC-SW1 (4)"}</pre>
<p>The 409 is a protection: Pune cannot be deleted while five devices sit in it. The message lists them, which is exactly what you need to decide what to do next.</p>

<h3>Catch the right thing</h3>
<p>Catch <code>pynetbox.RequestError</code> and read <code>e.req.status_code</code> and <code>e.error</code>. Catch <code>AllocationError</code> separately. Let connection problems propagate, or wrap them with a message that names the URL. Do not write <code>except Exception: pass</code>; a script that hides a 400 reports success while NetBox is unchanged.</p>

<div class="warn"><p><b>Common mistake.</b> Retrying a 400. The data will be just as wrong the second time. Retry only 502, 503 and timeouts, and only a few times with a pause.</p></div>
<div class="exam"><p><b>Exam trap.</b> A bulk <code>PATCH</code> with one bad item saves <i>none</i> of the others. A loop of single requests saves the good ones and leaves a half-finished result.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab raises the same classes and status codes. The exact wording of messages such as "Invalid IP address format" can differ a little between NetBox versions, so match on the status code and the field name rather than the full text. Messages for network failures come from the <code>requests</code> library; the lab trims the "Caused by" tail in <code>errors.py</code> only to keep the line short.</p></div>

<div class="scn"><h4>The green job that changed nothing</h4><p>A nightly script wrapped its create call in <code>try/except: pass</code> after an old error. For three weeks every new VLAN failed with "vid must be at most 4094" because a spreadsheet column had shifted. The job exited 0 each night. Someone noticed only when the change log showed no creates since the start of the month.</p><p><b>Lesson:</b> a script that cannot fail cannot be trusted. Print the error, count failures and exit non-zero.</p></div>
<div class="iv"><p class="q">"A bulk create of 50 objects returns 400. Are the 49 good ones saved?"</p><p>No. A bulk request runs in one transaction, so a single invalid item rolls back the entire batch. The response is a list with an empty object for each good item and the error for each bad one, so I can fix those and re-send the whole list.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>POST creates, PATCH changes some fields, DELETE removes; <code>update</code> takes a list of dictionaries with ids.</li>
<li>Bulk requests are atomic: one bad item saves nothing.</li>
<li>400 names the field, 403 is about the token, 409 is a protected delete, 502 means the server side is down.</li>
<li>Network errors never reach NetBox; they come from <code>requests</code>.</li>
<li>Catch <code>RequestError</code>, report it, and exit non-zero.</li></ul></div>`,hi:`
<p>Padhna maaf kar deta hai. Likhna nahi. Jo read galat cheez lautata hai woh ek minute barbaad karta hai; jo write galat jata hai woh us source of truth ko badal deta hai jis par baaki saari scripts bharosa karti hain. Isliye NetBox galat write ka saaf, khaas error se jawab deta hai, aur isliye aapki scripts ko un errors ko padhna chahiye, nigalna nahi.</p>

<h3>Chaar verbs</h3>
<table class="cmp"><tr><th>Verb</th><th>Matlab</th><th>pynetbox</th><th>Safalta</th></tr>
<tr><td>POST</td><td>create</td><td><code>endpoint.create(...)</code></td><td>201</td></tr>
<tr><td>PATCH</td><td>kuch fields badlo</td><td><code>endpoint.update([{"id": 7, ...}])</code></td><td>200</td></tr>
<tr><td>PUT</td><td>saare fields badlo</td><td>kam hi zaroorat</td><td>200</td></tr>
<tr><td>DELETE</td><td>hatao</td><td><code>record.delete()</code> ya <code>endpoint.delete([...])</code></td><td>204</td></tr></table>
<p>PUT nahi, PATCH use karo, taaki sirf wahi naam likho jo badalta hai. Dhyan do ki <code>update</code> dictionaries ki <i>list</i> leta hai, har ek mein <code>id</code>: yeh bulk form hai, aur is module ki har script isi se likhti hai.</p>

<h3>Bulk writes ya sab ya kuch nahi</h3>
<p><code>create</code> ya <code>update</code> ko list do to NetBox use ek request mein, ek database transaction ke andar karta hai. Koi ek item galat ho to kuch bhi save nahi hota.</p>
<pre class="code">import pynetbox

from nbconn import api

nb = api()
before = nb.ipam.vlans.count()
made = nb.ipam.vlans.create([{"vid": 110, "name": "LAB-A"}, {"vid": 120, "name": "LAB-B"}])
print("created in one call:", [(v.vid, v.name) for v in made], "| total", nb.ipam.vlans.count())

try:
    nb.ipam.vlans.create([{"vid": 130, "name": "LAB-C"}, {"vid": 5000, "name": "LAB-BAD"}])
except pynetbox.RequestError as err:
    print("one bad item:", err.req.status_code, err.error)
print("after the failed bulk call, total is still", nb.ipam.vlans.count())

nb.ipam.vlans.update([{"id": v.id, "description": "lab vlan"} for v in made])
print("descriptions:", [nb.ipam.vlans.get(v.id).description for v in made])

one = nb.ipam.vlans.get(made[0].id)
print("delete one record:", one.delete())
print("delete the rest:", nb.ipam.vlans.delete([made[1]]))
print("back to", nb.ipam.vlans.count(), "vlans, started with", before)</pre>
<pre class="out">AUTO01$ python3 bulk.py
created in one call: [(110, 'LAB-A'), (120, 'LAB-B')] | total 8
<span class="hl">one bad item: 400 [{},{"vid":["Ensure this value is less than or equal to 4094."]}]</span>
after the failed bulk call, total is still 8
descriptions: ['lab vlan', 'lab vlan']
delete one record: True
delete the rest: True
back to 6 vlans, started with 6</pre>
<p>Galat bulk call ka jawab ek list hai jisme har item ke liye ek entry: theek item ke liye khali object <code>{}</code> aur jo galat tha uske liye error. Yahan pehla VLAN valid tha, phir bhi "total is still 8" dikhata hai ki woh save nahi hua. Yahi <b>atomic</b> ka matlab hai, aur 200 changes push karte waqt yeh tohfa hai: aap kabhi aadhe-lage state mein nahi pahunchte.</p>
<pre class="out">AUTO01$ curl -sk -X PATCH -H "Authorization: Token $NETBOX_TOKEN" -H "Content-Type: application/json" -d '[{"id":1,"description":"a"},{"id":2,"status":"bogus"}]' $NETBOX_URL/api/dcim/sites/
[{},{"status":[""bogus" is not a valid choice."]}]</pre>

<h3>Har error, saath saath</h3>
<p>Script <code>errors.py</code> har kism ki failure trigger karti hai aur pynetbox jo kehta hai woh print karti hai. 400 wala parivaar sabse zyada milta hai, kyunki body field ka naam batati hai.</p>
<pre class="out">AUTO01$ python3 errors.py
missing slug -&gt; RequestError 400 | The request failed with code 400 Bad Request: {'slug': ['This field is required.']}
duplicate -&gt; RequestError 400 | The request failed with code 400 Bad Request: {'name': ['site with this name already exists.'], 'slug': ['site with this slug already exists.']}
bad choice -&gt; RequestError 400 | The request failed with code 400 Bad Request: {'status': ['"live" is not a valid choice.']}
bad foreign key -&gt; RequestError 400 | The request failed with code 400 Bad Request: {'device_type': ['Related object not found using the provided numeric ID: 99']}
bad address -&gt; RequestError 400 | The request failed with code 400 Bad Request: {'address': ['Invalid IP address format: 10.1.1.256/24']}
duplicate address -&gt; RequestError 400 | The request failed with code 400 Bad Request: {'address': ['Duplicate IP address found in global table: 10.99.0.1/24']}
vlan out of range -&gt; RequestError 400 | The request failed with code 400 Bad Request: {'vid': ['Ensure this value is less than or equal to 4094.']}
protected delete -&gt; RequestError 409 | The request failed with code 409 Conflict: {'detail': 'Unable to delete object. 5 dependent objects were found: PUN-R01 (1), PUN-CORE-R1 (1), PUN-CORE-R3 (2), PUN-DIST-SW1 ...
get matches two -&gt; ValueError | get() returned more than one result. Check that the kwarg(s) passed are valid for this endpoint or use filter() or all() instead.
filter without kwargs -&gt; ValueError | filter must be passed kwargs. Perhaps use all() instead.
unknown id -&gt; None
prefix is full -&gt; AllocationError | The requested allocation could not be fulfilled.
wrong token -&gt; RequestError 403 | The request failed with code 403 Forbidden: {'detail': 'Invalid token'}
no token -&gt; RequestError 403 | The request failed with code 403 Forbidden: {'detail': 'Authentication credentials were not provided.'}
no such host -&gt; Timeout | HTTPSConnectionPool(host='10.99.0.99', port=443): Max retries exceeded with url: /api/status/
plain h&#116;tp on 443 -&gt; ConnectionError | HTTPConnectionPool(host='10.99.0.80', port=80): Max retries exceeded with url: /api/status/
wrong port -&gt; ConnectionError | HTTPSConnectionPool(host='10.99.0.80', port=8443): Max retries exceeded with url: /api/status/</pre>
<table class="cmp"><tr><th>Status</th><th>Matlab</th><th>Kya karein</th></tr>
<tr><td>400</td><td>data galat hai; body field batati hai</td><td>data theek karo, retry mat karo</td></tr>
<tr><td>403</td><td>token nahi, galat token, ya token sirf padh sakta hai</td><td>credential theek karo</td></tr>
<tr><td>404</td><td>woh id ya URL exist nahi karta</td><td>id check karo; <code>get()</code> None lautata hai</td></tr>
<tr><td>409</td><td>delete mana: doosre objects is par nirbhar hain</td><td>pehle dependants hatao ya move karo</td></tr>
<tr><td>502 / 5xx</td><td>NetBox khud ya uske aage ka proxy down hai</td><td>platform team ko batao, phir baad mein retry</td></tr></table>
<p>Non-HT&#84;P errors bhi dekho. Galat host par <code>Timeout</code>, galat port ya TLS port par plain-text par <code>ConnectionError</code> aata hai, aur dono kabhi NetBox tak nahi pahunchte, isliye padhne ko JSON nahi hota. ValueErrors pynetbox se aate hain, koi request jaane se pehle.</p>
<pre class="out">AUTO01$ curl -sk -X POST -H "Authorization: Token $NETBOX_TOKEN" -H "Content-Type: application/json" -d '{"name":"Goa"}' $NETBOX_URL/api/dcim/sites/
{"slug":["This field is required."]}</pre>
<pre class="out">AUTO01$ curl -sk -X DELETE -H "Authorization: Token $NETBOX_TOKEN" $NETBOX_URL/api/dcim/sites/1/
{"detail":"Unable to delete object. 5 dependent objects were found: PUN-R01 (1), PUN-CORE-R1 (1), PUN-CORE-R3 (2), PUN-DIST-SW1 (3), PUN-ACC-SW1 (4)"}</pre>
<p>409 ek suraksha hai: Pune tab tak delete nahi ho sakta jab tak usme paanch devices hain. Message unhe list karta hai, jo aapko agla kadam tay karne ke liye chahiye.</p>

<h3>Sahi cheez pakdo</h3>
<p><code>pynetbox.RequestError</code> pakdo aur <code>e.req.status_code</code> aur <code>e.error</code> padho. <code>AllocationError</code> alag pakdo. Connection problems ko upar jane do, ya unhe aise message mein lapeto jo URL ka naam le. <code>except Exception: pass</code> mat likho; jo script 400 chhupati hai woh NetBox badla nahi hone par bhi safalta report karti hai.</p>

<div class="warn"><p><b>Common mistake.</b> 400 ko retry karna. Data doosri baar bhi utna hi galat hoga. Sirf 502, 503 aur timeouts retry karo, aur sirf kuch baar, beech mein ruk kar.</p></div>
<div class="exam"><p><b>Exam trap.</b> Ek galat item wala bulk <code>PATCH</code> baaki <i>kisi</i> ko save nahi karta. Single requests ka loop achhon ko save karta hai aur adhura result chhodta hai.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> Lab wahi classes aur status codes uthata hai. "Invalid IP address format" jaise messages ke exact shabd NetBox versions ke beech thode alag ho sakte hain, isliye poore text ki jagah status code aur field name par match karo. Network failures ke messages <code>requests</code> library se aate hain; lab mein <code>errors.py</code> sirf line chhoti rakhne ke liye "Caused by" wala hissa kaat deti hai.</p></div>

<div class="scn"><h4>Green job jisne kuch nahi badla</h4><p>Ek raat ki script ne purane error ke baad apni create call ko <code>try/except: pass</code> mein lapet diya. Teen hafte tak har naya VLAN "vid must be at most 4094" se fail hota raha kyunki spreadsheet ka ek column khisak gaya tha. Job har raat 0 se nikalti rahi. Kisi ne tab dekha jab change log mein mahine ki shuruat se koi create nahi tha.</p><p><b>Lesson:</b> jo script fail nahi ho sakti us par bharosa nahi kar sakte. Error print karo, failures gino aur non-zero se nikalo.</p></div>
<div class="iv"><p class="q">"50 objects ka bulk create 400 lautata hai. Kya 49 achhe save hue?"</p><p>Nahi. Bulk request ek transaction mein chalti hai, isliye ek invalid item poore batch ko rollback kar deta hai. Response ek list hai jisme har achhe item ke liye khali object aur har bure item ke liye error hota hai, isliye main unhe theek karke poori list dobara bhejta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>POST create karta hai, PATCH kuch fields badalta hai, DELETE hatata hai; <code>update</code> ids wali dictionaries ki list leta hai.</li>
<li>Bulk requests atomic hain: ek galat item se kuch save nahi hota.</li>
<li>400 field batata hai, 403 token ke baare mein hai, 409 protected delete hai, 502 matlab server side down.</li>
<li>Network errors NetBox tak nahi pahunchte; woh <code>requests</code> se aate hain.</li>
<li><code>RequestError</code> pakdo, report karo, aur non-zero se nikalo.</li></ul></div>`}};export{e as default};