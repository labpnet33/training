var e={id:`allocation`,h:{en:`Allocating prefixes and addresses without clashes`,hi:`Clash ke bina prefixes aur addresses allocate karna`},body:{en:`
<p>Before NetBox, the "next free address" lived in a spreadsheet, and the spreadsheet lived on someone's laptop. Two engineers opened it on the same morning and both gave 10.30.0.5 to a new server. IP address management (IPAM) exists to stop that, and the way it stops it is by making <i>NetBox</i> hand out the address, not the engineer.</p>

<h3>The pattern: ask the parent, do not calculate</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="A pool prefix gives a smaller prefix, which gives two addresses">
<rect x="20" y="70" width="170" height="60" rx="10" fill="#bae6fd"/><text x="105" y="97" text-anchor="middle" class="svg-ink" font-size="13">172.31.10.0/24</text><text x="105" y="116" text-anchor="middle" class="svg-ink" font-size="11">Pune point-to-point pool</text>
<rect x="250" y="70" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="325" y="97" text-anchor="middle" class="svg-ink" font-size="13">172.31.10.0/30</text><text x="325" y="116" text-anchor="middle" class="svg-ink" font-size="11">one link</text>
<rect x="470" y="20" width="150" height="50" rx="10" fill="#fde68a"/><text x="545" y="50" text-anchor="middle" class="svg-ink" font-size="13">172.31.10.1/30 : R1</text>
<rect x="470" y="140" width="150" height="50" rx="10" fill="#fde68a"/><text x="545" y="170" text-anchor="middle" class="svg-ink" font-size="13">172.31.10.2/30 : SW1</text>
<g stroke="#64748b" stroke-width="2" fill="none"><line x1="190" y1="100" x2="250" y2="100"/><line x1="400" y1="85" x2="470" y2="48"/><line x1="400" y1="115" x2="470" y2="165"/></g>
<text x="220" y="92" text-anchor="middle" class="svg-ink" font-size="10">available-prefixes</text>
<text x="436" y="84" text-anchor="middle" class="svg-ink" font-size="10">available-ips</text>
</svg><p class="cap">Two requests: one to the pool for a /30, then one to the /30 for each address.</p></div>
<p>A prefix object has two special sub-endpoints. <code>available-prefixes</code> lists the free blocks inside it, and a POST there <b>creates</b> the first free block of the size you ask for. <code>available-ips</code> does the same for addresses. In pynetbox these are <code>prefix.available_prefixes.create(...)</code> and <code>prefix.available_ips.create(...)</code>. NetBox does the arithmetic and the bookkeeping in one step, so two scripts that run at the same moment get two different answers.</p>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Token $NETBOX_TOKEN" "$NETBOX_URL/api/ipam/prefixes/5/available-ips/?limit=3"
[{"family":4,"address":"10.30.0.1/24","vrf":null,"description":""},{"family":4,"address":"10.30.0.2/24","vrf":null,"description":""},{"family":4,"address":"10.30.0.3/24","vrf":null,"description":""}]</pre>

<h3>Lab 1, task 3 as code</h3>
<pre class="code">"""allocate.py - carve a /30 from the Pune point-to-point pool and give both ends an address"""
from nbconn import api

POOL = "172.31.10.0/24"
ENDS = [("PUN-CORE-R1", "GigabitEthernet0/1"), ("PUN-DIST-SW1", "GigabitEthernet1/0/1")]

nb = api()
first = nb.dcim.interfaces.get(device=ENDS[0][0], name=ENDS[0][1])
if nb.ipam.ip_addresses.get(interface_id=first.id):
    print("already allocated, nothing to do")
    raise SystemExit(0)

pool = nb.ipam.prefixes.get(prefix=POOL)
link = pool.available_prefixes.create({"prefix_length": 30, "description": "%s to %s" % (ENDS[0][0], ENDS[1][0])})
print("new prefix:", link, "from", pool)
for device, name in ENDS:
    ifc = nb.dcim.interfaces.get(device=device, name=name)
    ip = link.available_ips.create({"description": "%s %s" % (device, name),
                                    "assigned_object_type": "dcim.interface", "assigned_object_id": ifc.id})
    print("  %-13s %-20s %s" % (device, name, ip))</pre>
<pre class="out">AUTO01$ python3 allocate.py
new prefix: 172.31.10.0/30 from 172.31.10.0/24
  PUN-CORE-R1   GigabitEthernet0/1   172.31.10.1/30
  PUN-DIST-SW1  GigabitEthernet1/0/1 172.31.10.2/30</pre>
<p>Read the order of events. The script first checks whether R1's interface already has an address; if so it exits quietly. Then it creates the /30 from the pool, and for each end it creates an address already <b>assigned</b> to the interface (<code>assigned_object_type</code> and <code>assigned_object_id</code> are the pair that attaches an IP to an interface). The .1 and .2 come out in order, because "first free" is how the endpoint works.</p>

<h3>Idempotence: run it again</h3>
<pre class="out">AUTO01$ python3 allocate.py
already allocated, nothing to do</pre>
<p>A script that allocates must be safe to run twice. Without the guard at the top, the second run would carve a second /30 and leave the first one orphaned. The guard asks the question the whole script is about: "does this interface already have an address in NetBox?". If yes, stop.</p>

<h3>Checking what NetBox now holds</h3>
<p>Two filters let you inspect the tree below a prefix. <code>within</code> lists the prefixes inside a parent; <code>parent</code> lists the addresses inside a prefix. Remember the trap from chapter 4: <code>prefixes?parent=</code> is not a thing, and it is ignored without an error.</p>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Token $NETBOX_TOKEN" "$NETBOX_URL/api/ipam/prefixes/?within=172.31.10.0/24&amp;fields=id,prefix,description"
{"count":1,"next":null,"previous":null,"results":[{"id":11,"prefix":"172.31.10.0/30","description":"PUN-CORE-R1 to PUN-DIST-SW1"}]}</pre>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Token $NETBOX_TOKEN" "$NETBOX_URL/api/ipam/ip-addresses/?parent=172.31.10.0/30&amp;fields=id,address,description"
{"count":2,"next":null,"previous":null,"results":[{"id":11,"address":"172.31.10.1/30","description":"PUN-CORE-R1 GigabitEthernet0/1"},{"id":12,"address":"172.31.10.2/30","description":"PUN-DIST-SW1 GigabitEthernet1/0/1"}]}</pre>
<p>Every allocation leaves a record too. The change log is a list of who did what, which is how you answer "who gave this address away?" a year later.</p>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Token $NETBOX_TOKEN" "$NETBOX_URL/api/core/object-changes/?ordering=id&amp;fields=id,action,object_repr"
{"count":9,"next":null,"previous":null,"results":[{"id":1,"action":{"value":"create","label":"Created"},"object_repr":"LAB-A (110)"},{"id":2,"action":{"value":"create","label":"Created"},"object_repr":"LAB-B (120)"},{"id":3,"action":{"value":"update","label":" ...</pre>

<h3>When the pool is full</h3>
<p>If the parent has no free block that large, the POST fails: pynetbox raises <code>AllocationError</code> ("The requested allocation could not be fulfilled"). Treat it as a capacity alert, not a bug. The fix is a bigger pool or a smaller request, and it is a decision for a person.</p>

<div class="warn"><p><b>Common mistake.</b> Reading the list of <code>available-ips</code> and then creating an address with POST <code>/ip-addresses/</code> using the first one. Between the read and the write another script may have taken it. Create through <code>available-ips</code> and let NetBox take the lock.</p></div>
<div class="exam"><p><b>Exam trap.</b> A GET on <code>available-ips</code> only <i>shows</i> free addresses and reserves nothing. Only the POST allocates.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> Both endpoints behave as described. A real NetBox also respects VRFs, pools flagged as "mark utilized", and the setting that decides whether the network and broadcast addresses of a /31 or /32 are usable, so the first free address you get can differ. Tell your reviewers which VRF the script allocates in.</p></div>

<div class="scn"><h4>Two /30 links for one cable</h4><p>An onboarding script was triggered twice by an impatient colleague. Both runs allocated a /30 and assigned addresses. The router got the second pair, the first pair was left in NetBox marked as used, and a month later a monitoring job reported "172.31.10.1 not reachable". The cure was an existence check before allocation, and a nightly report that listed prefixes with no assigned interface.</p><p><b>Lesson:</b> an automation that creates must first ask if the thing exists.</p></div>
<div class="iv"><p class="q">"How do you allocate the next free IP safely from a script?"</p><p>I never calculate it myself. I POST to the prefix's <code>available-ips</code> endpoint, which reserves the first free address in one step, and I attach it to an interface in the same call. Before that I check whether the object already has an address so that re-running the script does nothing.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Let NetBox hand out blocks: <code>available-prefixes</code> and <code>available-ips</code>.</li>
<li>GET shows free space; POST allocates.</li>
<li>Assign to an interface with <code>assigned_object_type</code> plus <code>assigned_object_id</code>.</li>
<li>Guard first, so a second run changes nothing.</li>
<li>Inspect with <code>within</code> (prefixes) and <code>parent</code> (addresses); <code>AllocationError</code> means the pool is full.</li></ul></div>`,hi:`
<p>NetBox se pehle "agla free address" ek spreadsheet mein rehta tha, aur spreadsheet kisi ke laptop par. Do engineers ne ek hi subah use khola aur dono ne naye server ko 10.30.0.5 de diya. IP address management (IPAM) isi ko rokne ke liye hai, aur woh rokta hai is tarah ki address <i>NetBox</i> deta hai, engineer nahi.</p>

<h3>Pattern: parent se poocho, khud calculate mat karo</h3>
<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Pool prefix se chhota prefix milta hai, jisse do addresses milte hain">
<rect x="20" y="70" width="170" height="60" rx="10" fill="#bae6fd"/><text x="105" y="97" text-anchor="middle" class="svg-ink" font-size="13">172.31.10.0/24</text><text x="105" y="116" text-anchor="middle" class="svg-ink" font-size="11">Pune point-to-point pool</text>
<rect x="250" y="70" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="325" y="97" text-anchor="middle" class="svg-ink" font-size="13">172.31.10.0/30</text><text x="325" y="116" text-anchor="middle" class="svg-ink" font-size="11">ek link</text>
<rect x="470" y="20" width="150" height="50" rx="10" fill="#fde68a"/><text x="545" y="50" text-anchor="middle" class="svg-ink" font-size="13">172.31.10.1/30 : R1</text>
<rect x="470" y="140" width="150" height="50" rx="10" fill="#fde68a"/><text x="545" y="170" text-anchor="middle" class="svg-ink" font-size="13">172.31.10.2/30 : SW1</text>
<g stroke="#64748b" stroke-width="2" fill="none"><line x1="190" y1="100" x2="250" y2="100"/><line x1="400" y1="85" x2="470" y2="48"/><line x1="400" y1="115" x2="470" y2="165"/></g>
<text x="220" y="92" text-anchor="middle" class="svg-ink" font-size="10">available-prefixes</text>
<text x="436" y="84" text-anchor="middle" class="svg-ink" font-size="10">available-ips</text>
</svg><p class="cap">Do requests: pool se /30 ke liye ek, phir /30 se har address ke liye ek.</p></div>
<p>Prefix object ke do khaas sub-endpoints hote hain. <code>available-prefixes</code> uske andar ke free blocks list karta hai, aur wahan POST jo size aap maangte ho uska pehla free block <b>banata</b> hai. <code>available-ips</code> addresses ke liye wahi karta hai. pynetbox mein yeh <code>prefix.available_prefixes.create(...)</code> aur <code>prefix.available_ips.create(...)</code> hain. NetBox hisaab aur bookkeeping ek hi step mein karta hai, isliye ek hi pal chalne wali do scripts ko do alag jawab milte hain.</p>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Token $NETBOX_TOKEN" "$NETBOX_URL/api/ipam/prefixes/5/available-ips/?limit=3"
[{"family":4,"address":"10.30.0.1/24","vrf":null,"description":""},{"family":4,"address":"10.30.0.2/24","vrf":null,"description":""},{"family":4,"address":"10.30.0.3/24","vrf":null,"description":""}]</pre>

<h3>Lab 1, task 3 code ke roop mein</h3>
<pre class="code">"""allocate.py - carve a /30 from the Pune point-to-point pool and give both ends an address"""
from nbconn import api

POOL = "172.31.10.0/24"
ENDS = [("PUN-CORE-R1", "GigabitEthernet0/1"), ("PUN-DIST-SW1", "GigabitEthernet1/0/1")]

nb = api()
first = nb.dcim.interfaces.get(device=ENDS[0][0], name=ENDS[0][1])
if nb.ipam.ip_addresses.get(interface_id=first.id):
    print("already allocated, nothing to do")
    raise SystemExit(0)

pool = nb.ipam.prefixes.get(prefix=POOL)
link = pool.available_prefixes.create({"prefix_length": 30, "description": "%s to %s" % (ENDS[0][0], ENDS[1][0])})
print("new prefix:", link, "from", pool)
for device, name in ENDS:
    ifc = nb.dcim.interfaces.get(device=device, name=name)
    ip = link.available_ips.create({"description": "%s %s" % (device, name),
                                    "assigned_object_type": "dcim.interface", "assigned_object_id": ifc.id})
    print("  %-13s %-20s %s" % (device, name, ip))</pre>
<pre class="out">AUTO01$ python3 allocate.py
new prefix: 172.31.10.0/30 from 172.31.10.0/24
  PUN-CORE-R1   GigabitEthernet0/1   172.31.10.1/30
  PUN-DIST-SW1  GigabitEthernet1/0/1 172.31.10.2/30</pre>
<p>Ghatnaon ka kram padho. Script pehle dekhti hai ki R1 ke interface par address pehle se hai ya nahi; hai to chupchap nikal jati hai. Phir pool se /30 banati hai, aur har end ke liye aisa address banati hai jo interface se pehle hi <b>assigned</b> hai (<code>assigned_object_type</code> aur <code>assigned_object_id</code> woh jodi hai jo IP ko interface se jodti hai). .1 aur .2 kram se aate hain, kyunki "pehla free" hi endpoint ka tareeka hai.</p>

<h3>Idempotence: dobara chalao</h3>
<pre class="out">AUTO01$ python3 allocate.py
already allocated, nothing to do</pre>
<p>Jo script allocate karti hai woh do baar chalane par safe honi chahiye. Upar ke guard ke bina doosri run doosra /30 bana deti aur pehle ko anaath chhod deti. Guard woh sawal poochta hai jis par poori script tiki hai: "kya is interface par NetBox mein address pehle se hai?" Hai to ruk jao.</p>

<h3>Dekhna ki NetBox ke paas ab kya hai</h3>
<p>Do filters prefix ke neeche ka tree dikhate hain. <code>within</code> parent ke andar ke prefixes list karta hai; <code>parent</code> prefix ke andar ke addresses. Chapter 4 ka jaal yaad rakho: <code>prefixes?parent=</code> jaisi koi cheez nahi, aur woh bina error ke ignore ho jati hai.</p>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Token $NETBOX_TOKEN" "$NETBOX_URL/api/ipam/prefixes/?within=172.31.10.0/24&amp;fields=id,prefix,description"
{"count":1,"next":null,"previous":null,"results":[{"id":11,"prefix":"172.31.10.0/30","description":"PUN-CORE-R1 to PUN-DIST-SW1"}]}</pre>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Token $NETBOX_TOKEN" "$NETBOX_URL/api/ipam/ip-addresses/?parent=172.31.10.0/30&amp;fields=id,address,description"
{"count":2,"next":null,"previous":null,"results":[{"id":11,"address":"172.31.10.1/30","description":"PUN-CORE-R1 GigabitEthernet0/1"},{"id":12,"address":"172.31.10.2/30","description":"PUN-DIST-SW1 GigabitEthernet1/0/1"}]}</pre>
<p>Har allocation ek record bhi chhodta hai. Change log yeh list hai ki kisne kya kiya, jisse saal bhar baad aap "yeh address kisne diya?" ka jawab dete ho.</p>
<pre class="out">AUTO01$ curl -sk -H "Authorization: Token $NETBOX_TOKEN" "$NETBOX_URL/api/core/object-changes/?ordering=id&amp;fields=id,action,object_repr"
{"count":9,"next":null,"previous":null,"results":[{"id":1,"action":{"value":"create","label":"Created"},"object_repr":"LAB-A (110)"},{"id":2,"action":{"value":"create","label":"Created"},"object_repr":"LAB-B (120)"},{"id":3,"action":{"value":"update","label":" ...</pre>

<h3>Jab pool bhar jaye</h3>
<p>Agar parent mein itna bada free block nahi hai to POST fail hota hai: pynetbox <code>AllocationError</code> uthata hai ("The requested allocation could not be fulfilled"). Use bug nahi, capacity alert maano. Hal hai bada pool ya chhota request, aur yeh insaan ka faisla hai.</p>

<div class="warn"><p><b>Common mistake.</b> <code>available-ips</code> ki list padhna aur phir pehle wale ke saath POST <code>/ip-addresses/</code> se address banana. Padhne aur likhne ke beech koi aur script use le sakti hai. <code>available-ips</code> se create karo aur lock NetBox ko lene do.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>available-ips</code> par GET sirf free addresses <i>dikhata</i> hai aur kuch reserve nahi karta. Sirf POST allocate karta hai.</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> Dono endpoints bataye anusaar chalte hain. Asli NetBox VRFs, "mark utilized" pools, aur /31 ya /32 ke network aur broadcast addresses usable hain ya nahi wali setting ko bhi maanta hai, isliye milne wala pehla free address alag ho sakta hai. Apne reviewers ko batao ki script kis VRF mein allocate karti hai.</p></div>

<div class="scn"><h4>Ek cable ke liye do /30 links</h4><p>Ek impatient colleague ne onboarding script do baar trigger kar di. Dono runs ne /30 allocate kiya aur addresses assign kiye. Router ko doosra jodi mili, pehli jodi NetBox mein used ki tarah padi rahi, aur mahine baad monitoring job ne "172.31.10.1 not reachable" report kiya. Ilaaj tha allocation se pehle existence check, aur raat ki report jo aise prefixes list karti hai jinka koi interface assigned nahi.</p><p><b>Lesson:</b> jo automation banati hai use pehle poochna chahiye ki woh cheez pehle se hai ya nahi.</p></div>
<div class="iv"><p class="q">"Script se agla free IP safely kaise allocate karte ho?"</p><p>Main use khud calculate nahi karta. Main prefix ke <code>available-ips</code> endpoint par POST karta hoon, jo pehla free address ek hi step mein reserve kar deta hai, aur usi call mein use interface se jod deta hoon. Uske pehle check karta hoon ki object ke paas address pehle se hai ya nahi, taaki script dobara chale to kuch na badle.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NetBox se blocks lo: <code>available-prefixes</code> aur <code>available-ips</code>.</li>
<li>GET free jagah dikhata hai; POST allocate karta hai.</li>
<li>Interface se jodo <code>assigned_object_type</code> aur <code>assigned_object_id</code> se.</li>
<li>Pehle guard, taaki doosri run kuch na badle.</li>
<li><code>within</code> (prefixes) aur <code>parent</code> (addresses) se jaancho; <code>AllocationError</code> matlab pool bhar gaya.</li></ul></div>`}};export{e as default};