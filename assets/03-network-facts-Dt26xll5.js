var e={id:`network-facts`,h:{en:`Everything a network object knows`,hi:`Network object kya kya jaanta hai`},body:{en:`
<p><b>One idea:</b> an <code>ip_network</code> object is a tiny subnet calculator. You never calculate the broadcast address, mask or host count yourself. You only ask. Each question is an attribute (a fact the object already knows) and the answer is printed.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Network address first, 10.60.4.0 to Usable hosts 10.60.4.1 to 5.254 to Broadcast last, 10.60.5.255"><rect x="20" y="40" width="177" height="76" rx="10" fill="#bae6fd"/><text x="108.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">Network address</text><text x="108.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">first, 10.60.4.0</text><line x1="197" y1="78" x2="227" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="231,78 223,73 223,83" fill="#64748b"/><rect x="231" y="40" width="177" height="76" rx="10" fill="#bbf7d0"/><text x="319.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">Usable hosts</text><text x="319.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">10.60.4.1 to 5.254</text><line x1="408" y1="78" x2="438" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="442,78 434,73 434,83" fill="#64748b"/><rect x="442" y="40" width="177" height="76" rx="10" fill="#fed7aa"/><text x="530.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">Broadcast</text><text x="530.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">last, 10.60.5.255</text></svg><p class="cap">A /23 spans 512 addresses. The first is the network address, the last is the broadcast address, 510 in between are usable.</p></div>
<h3>The facts, one per line</h3>
<pre class="code">import ipaddress

net = ipaddress.ip_network("10.60.4.0/23")
print(net.network_address)
print(net.broadcast_address)
print(net.netmask)
print(net.hostmask)
print(net.prefixlen)
print(net.num_addresses)
print(net.num_addresses - 2)</pre>
<pre class="out">10.60.4.0
10.60.5.255
255.255.254.0
0.0.1.255
23
512
510</pre>
<ul><li><code>network_address</code> and <code>broadcast_address</code> are the first and last addresses of the subnet.</li><li><code>netmask</code> is the dotted mask (255.255.254.0) and <code>hostmask</code> is its inverse (0.0.1.255), the wildcard style used in ACLs and OSPF network statements.</li><li><code>prefixlen</code> is the number after the slash. <code>num_addresses</code> counts every address. For ordinary IPv4 subnets, usable hosts are that number minus 2, which you calculate with plain arithmetic: <code>-</code> is minus.</li></ul>
<h3>The list of usable hosts</h3>
<pre class="code">import ipaddress

net = ipaddress.ip_network("10.60.7.0/26")
usable = list(net.hosts())
print(len(usable))
print(usable[0])
print(usable[-1])
print(type(net.hosts()).__name__)
print(list(ipaddress.ip_network("10.60.7.0/30").hosts()))</pre>
<pre class="out">62
10.60.7.1
10.60.7.62
generator
[IPv4Address('10.60.7.1'), IPv4Address('10.60.7.2')]</pre>
<p><code>net.hosts()</code> produces the usable addresses one at a time. That kind of object is a <b>generator</b>: it makes values when you ask rather than storing them all, so the fourth print shows only the kind of object, <code>generator</code>, not the addresses. When a list is printed, each address appears in its official form, <code>IPv4Address('10.60.7.1')</code>; that is normal. Wrap it in <code>list(...)</code> to get a real list. <code>len(x)</code> counts the items in a list. <code>usable[0]</code> is the first item (Python counts from zero) and <code>usable[-1]</code> is the last. The square brackets after a name mean "pick the item at this position". Many designs use the first usable address (10.60.7.1) as the gateway; a script can do the same without a human choosing.</p>
<h3>Special sizes and IPv6</h3>
<pre class="code">import ipaddress

for text in ["10.60.7.0/31", "10.60.7.5/32"]:
    n = ipaddress.ip_network(text)
    print(text, n.num_addresses, list(n.hosts()))
v6 = ipaddress.ip_network("2001:db8:10::/64")
print(v6.num_addresses)
print(v6.network_address, v6.prefixlen)</pre>
<pre class="out">10.60.7.0/31 2 [IPv4Address('10.60.7.0'), IPv4Address('10.60.7.1')]
10.60.7.5/32 1 [IPv4Address('10.60.7.5')]
18446744073709551616
2001:db8:10:: 64</pre>
<p>A /31 is used on router-to-router links (RFC 3021) and both addresses are usable, so the module lists both. A /32 is a single host, listed as itself. An IPv6 /64 holds 18,446,744,073,709,551,616 addresses, which is why IPv6 has no "minus 2" rule in the same way and why you never list its hosts. Do not call <code>list(net.hosts())</code> on a big IPv6 network; it would try to build trillions of items.</p>
<table class="cmp"><tr><th>Prefix</th><th>Addresses</th><th>Usable (IPv4)</th></tr><tr><td>/24</td><td>256</td><td>254</td></tr><tr><td>/26</td><td>64</td><td>62</td></tr><tr><td>/30</td><td>4</td><td>2</td></tr><tr><td>/31</td><td>2</td><td>2 (point-to-point)</td></tr><tr><td>/32</td><td>1</td><td>1 (a single host)</td></tr></table>
<div class="eg"><p><b>Worked example.</b> Lab 1 plans three subnets in the 10.60.4.0/22 block. The MGMT subnet is a /26, so the plan shows 64 addresses, gateway 10.60.7.1 and 62 usable hosts. The script prints those facts in a table so the field engineers do not have to calculate anything.</p></div>
<div class="warn"><p><b>Common mistake.</b> Printing <code>net.hosts()</code> directly and expecting a list of addresses. You get a generator object description instead. Always wrap it in <code>list()</code> or loop over it.</p></div>
<div class="exam"><p><b>Exam trap.</b> The number of usable hosts in an ordinary IPv4 subnet is <code>num_addresses - 2</code>. The two exceptions the exam may test are /31 (2 usable, point-to-point) and /32 (1 host).</p></div>
<div class="scn"><h4>The gateway nobody remembered</h4><p>A new floor had a /26 but the switch configuration used the broadcast address as the default gateway by mistake, so users had no connectivity. A script printed the usable range 10.60.7.1 to 10.60.7.62 for every subnet in the design, and the wrong gateway 10.60.7.63 stood out immediately.</p><p><b>Lesson:</b> Print the usable range; hosts must sit between network and broadcast.</p></div>
<div class="iv"><p class="q">"How do you find the usable host range of a subnet in Python?"</p><p>Build an <code>ip_network</code> object, then use <code>net.hosts()</code>. I wrap it in <code>list()</code>, take the first and last items, and count them with <code>len()</code>. I also mention that <code>num_addresses - 2</code> gives the same count for normal IPv4 subnets, and that /31 and /32 are special cases.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Ask the network object for <code>network_address</code>, <code>broadcast_address</code>, <code>netmask</code>, <code>hostmask</code>, <code>prefixlen</code>, <code>num_addresses</code>.</li><li><code>hosts()</code> is a generator; wrap it in <code>list()</code> to see or count the usable addresses.</li><li>Usable IPv4 hosts equal <code>num_addresses - 2</code>, except /31 and /32.</li><li><code>list[0]</code> is the first item and <code>list[-1]</code> the last.</li><li>Never list the hosts of a big IPv6 network.</li></ul></div>
`,hi:`
<p><b>Ek idea:</b> <code>ip_network</code> object ek chhota subnet calculator hai. Aap broadcast address, mask ya host count khud calculate nahi karte. Aap sirf poochhte ho. Har sawaal ek attribute hai (aisa fact jo object ko pehle se pata hai) aur jawab print hota hai.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Network address pehla, 10.60.4.0 to Usable hosts 10.60.4.1 se 5.254 to Broadcast aakhri, 10.60.5.255"><rect x="20" y="40" width="177" height="76" rx="10" fill="#bae6fd"/><text x="108.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">Network address</text><text x="108.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">pehla, 10.60.4.0</text><line x1="197" y1="78" x2="227" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="231,78 223,73 223,83" fill="#64748b"/><rect x="231" y="40" width="177" height="76" rx="10" fill="#bbf7d0"/><text x="319.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">Usable hosts</text><text x="319.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">10.60.4.1 se 5.254</text><line x1="408" y1="78" x2="438" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="442,78 434,73 434,83" fill="#64748b"/><rect x="442" y="40" width="177" height="76" rx="10" fill="#fed7aa"/><text x="530.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">Broadcast</text><text x="530.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">aakhri, 10.60.5.255</text></svg><p class="cap">/23 mein 512 addresses hain. Pehla network address hai, aakhri broadcast address hai, beech ke 510 usable hain.</p></div>
<h3>Facts, ek line mein ek</h3>
<pre class="code">import ipaddress

net = ipaddress.ip_network("10.60.4.0/23")
print(net.network_address)
print(net.broadcast_address)
print(net.netmask)
print(net.hostmask)
print(net.prefixlen)
print(net.num_addresses)
print(net.num_addresses - 2)</pre>
<pre class="out">10.60.4.0
10.60.5.255
255.255.254.0
0.0.1.255
23
512
510</pre>
<ul><li><code>network_address</code> aur <code>broadcast_address</code> subnet ka pehla aur aakhri address hain.</li><li><code>netmask</code> dotted mask (255.255.254.0) hai aur <code>hostmask</code> uska ulta (0.0.1.255), jo ACLs aur OSPF network statements mein wildcard style mein use hota hai.</li><li><code>prefixlen</code> slash ke baad ka number hai. <code>num_addresses</code> har address gintha hai. Aam IPv4 subnets mein usable hosts us number minus 2 hote hain, jo seedhe arithmetic se nikalte hain: <code>-</code> minus hai.</li></ul>
<h3>Usable hosts ki list</h3>
<pre class="code">import ipaddress

net = ipaddress.ip_network("10.60.7.0/26")
usable = list(net.hosts())
print(len(usable))
print(usable[0])
print(usable[-1])
print(type(net.hosts()).__name__)
print(list(ipaddress.ip_network("10.60.7.0/30").hosts()))</pre>
<pre class="out">62
10.60.7.1
10.60.7.62
generator
[IPv4Address('10.60.7.1'), IPv4Address('10.60.7.2')]</pre>
<p><code>net.hosts()</code> usable addresses ek-ek karke banata hai. Aise object ko <b>generator</b> kehte hain: yeh sab values store nahi karta, maangne par banata hai, isliye chauthe print mein addresses nahi, sirf object ki kism, <code>generator</code>, dikhti hai. List print hone par har address apne official roop <code>IPv4Address('10.60.7.1')</code> mein dikhta hai; yeh normal hai. Asli list ke liye use <code>list(...)</code> mein wrap karo. <code>len(x)</code> list ke items gintha hai. <code>usable[0]</code> pehla item hai (Python zero se ginta hai) aur <code>usable[-1]</code> aakhri. Name ke baad square brackets ka matlab "is position ka item do". Bahut designs pehla usable address (10.60.7.1) gateway rakhte hain; script bhi wahi kar sakti hai, kisi insaan ke chunne ki zaroorat nahi.</p>
<h3>Special sizes aur IPv6</h3>
<pre class="code">import ipaddress

for text in ["10.60.7.0/31", "10.60.7.5/32"]:
    n = ipaddress.ip_network(text)
    print(text, n.num_addresses, list(n.hosts()))
v6 = ipaddress.ip_network("2001:db8:10::/64")
print(v6.num_addresses)
print(v6.network_address, v6.prefixlen)</pre>
<pre class="out">10.60.7.0/31 2 [IPv4Address('10.60.7.0'), IPv4Address('10.60.7.1')]
10.60.7.5/32 1 [IPv4Address('10.60.7.5')]
18446744073709551616
2001:db8:10:: 64</pre>
<p>/31 router-to-router links par use hota hai (RFC 3021) aur dono addresses usable hain, isliye module dono list karta hai. /32 ek single host hai, khud list hota hai. IPv6 /64 mein 18,446,744,073,709,551,616 addresses hote hain, isiliye IPv6 mein "minus 2" rule waise nahi chalta aur uske hosts kabhi list nahi karte. Bade IPv6 network par <code>list(net.hosts())</code> mat chalao; yeh kharbon items banane ki koshish karega.</p>
<table class="cmp"><tr><th>Prefix</th><th>Addresses</th><th>Usable (IPv4)</th></tr><tr><td>/24</td><td>256</td><td>254</td></tr><tr><td>/26</td><td>64</td><td>62</td></tr><tr><td>/30</td><td>4</td><td>2</td></tr><tr><td>/31</td><td>2</td><td>2 (point-to-point)</td></tr><tr><td>/32</td><td>1</td><td>1 (single host)</td></tr></table>
<div class="eg"><p><b>Worked example.</b> Lab 1 10.60.4.0/22 block mein teen subnets plan karta hai. MGMT subnet /26 hai, isliye plan mein 64 addresses, gateway 10.60.7.1 aur 62 usable hosts dikhte hain. Script yeh facts table mein print karti hai taaki field engineers ko kuch calculate na karna pade.</p></div>
<div class="warn"><p><b>Aam galti.</b> <code>net.hosts()</code> seedha print karke addresses ki list ki umeed karna. Aapko generator object ka description milta hai. Hamesha use <code>list()</code> mein wrap karo ya loop mein use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Aam IPv4 subnet ke usable hosts <code>num_addresses - 2</code> hote hain. Do exceptions jo exam pooch sakta hai: /31 (2 usable, point-to-point) aur /32 (1 host).</p></div>
<div class="scn"><h4>Gateway jo kisi ko yaad nahi tha</h4><p>Naye floor ko /26 mila lekin switch configuration mein galti se broadcast address default gateway ban gaya, isliye users ka connectivity nahi tha. Ek script ne design ke har subnet ki usable range 10.60.7.1 se 10.60.7.62 print ki, aur galat gateway 10.60.7.63 turant alag dikh gaya.</p><p><b>Lesson:</b> Usable range print karo; hosts network aur broadcast ke beech mein hone chahiye.</p></div>
<div class="iv"><p class="q">"Python mein subnet ki usable host range kaise nikaalte ho?"</p><p><code>ip_network</code> object banao, phir <code>net.hosts()</code> use karo. Main use <code>list()</code> mein wrap karta hoon, pehla aur aakhri item leta hoon, aur <code>len()</code> se ginta hoon. Main yeh bhi batata hoon ki normal IPv4 subnets mein <code>num_addresses - 2</code> wahi count deta hai, aur /31 tatha /32 special cases hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Network object se <code>network_address</code>, <code>broadcast_address</code>, <code>netmask</code>, <code>hostmask</code>, <code>prefixlen</code>, <code>num_addresses</code> poochho.</li><li><code>hosts()</code> generator hai; usable addresses dekhne ya ginne ke liye <code>list()</code> mein wrap karo.</li><li>Usable IPv4 hosts <code>num_addresses - 2</code> hote hain, /31 aur /32 ko chhodkar.</li><li><code>list[0]</code> pehla item aur <code>list[-1]</code> aakhri.</li><li>Bade IPv6 network ke hosts kabhi list mat karo.</li></ul></div>
`}};export{e as default};