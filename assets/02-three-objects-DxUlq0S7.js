var e={id:`three-objects`,h:{en:`Three kinds of objects: address, network, interface`,hi:`Teen tarah ke objects: address, network, interface`},body:{en:`
<p><b>One small idea for this chapter:</b> the module gives you three different "things", and choosing the right one is half the work. Compare them with a postal system. A <b>house number</b> is one address. A <b>street</b> is a group of house numbers. And "<b>house 12 on Gandhi Road</b>" is a house number together with the street it belongs to. Networking has the same three levels.</p>
<table class="cmp"><tr><th>Object</th><th>Meaning</th><th>Example text</th><th>Router analogy</th></tr><tr><td><code>ip_address</code></td><td>One host address</td><td>10.60.7.12</td><td>A device on the network</td></tr><tr><td><code>ip_network</code></td><td>A whole subnet</td><td>10.60.7.0/26</td><td>The VLAN or subnet</td></tr><tr><td><code>ip_interface</code></td><td>Address plus its mask</td><td>10.60.7.12/26</td><td>The line under "interface" on a router</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="ip_address 10.60.7.12 to ip_network 10.60.7.0/26 to ip_interface 10.60.7.12/26"><rect x="20" y="40" width="177" height="76" rx="10" fill="#fde68a"/><text x="108.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">ip_address</text><text x="108.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">10.60.7.12</text><line x1="197" y1="78" x2="227" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="231,78 223,73 223,83" fill="#64748b"/><text x="214" y="70" text-anchor="middle" class="svg-accent" font-size="11">.ip</text><rect x="231" y="40" width="177" height="76" rx="10" fill="#bae6fd"/><text x="319.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">ip_network</text><text x="319.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">10.60.7.0/26</text><line x1="408" y1="78" x2="438" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="442,78 434,73 434,83" fill="#64748b"/><text x="425" y="70" text-anchor="middle" class="svg-accent" font-size="11">.network</text><rect x="442" y="40" width="177" height="76" rx="10" fill="#bbf7d0"/><text x="530.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">ip_interface</text><text x="530.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">10.60.7.12/26</text></svg><p class="cap">An interface object contains both: its .ip is the address and its .network is the subnet.</p></div>
<h3>Building each object</h3>
<pre class="code">import ipaddress

ip = ipaddress.ip_address("10.60.7.12")
net = ipaddress.ip_network("10.60.7.0/26")
iface = ipaddress.ip_interface("10.60.7.12/26")

print(ip)
print(net)
print(iface)
print(iface.ip)
print(iface.network)
print(type(ip))</pre>
<p>Line by line: <code>ip_address("10.60.7.12")</code> reads the text and builds an address object. <code>ip_network("10.60.7.0/26")</code> builds a subnet object. <code>ip_interface("10.60.7.12/26")</code> keeps the address and the mask together, exactly like the <code>ip address 10.60.7.12 255.255.255.192</code> line on a switch port. The dot after a name, such as <code>iface.ip</code>, means "ask this object for its piece called ip". That piece is an <b>attribute</b>. <code>type(ip)</code> tells you what kind of object a variable holds, which is useful when you are unsure.</p>
<pre class="out">10.60.7.12
10.60.7.0/26
10.60.7.12/26
10.60.7.12
10.60.7.0/26
&lt;class 'ipaddress.IPv4Address'&gt;</pre>
<p>Notice that <code>iface.network</code> printed <code>10.60.7.0/26</code> even though you never typed it. Python worked out the subnet from the address and the mask. That is the first time the module saved you a manual calculation.</p>
<h3>Objects are not strings</h3>
<pre class="code">import ipaddress

print("10.60.7.9" &gt; "10.60.7.10")
a = ipaddress.ip_address("10.60.7.9")
b = ipaddress.ip_address("10.60.7.10")
print(a &gt; b)
print(str(a) + " is the text form")
print(ipaddress.ip_address("2001:db8::1").version)</pre>
<pre class="out">True
False
10.60.7.9 is the text form
6</pre>
<p>The first line compares two <b>strings</b>. Text is compared character by character, so <code>"9"</code> sorts after <code>"1"</code> and <code>"10.60.7.9"</code> looks bigger than <code>"10.60.7.10"</code>. That is wrong for addresses. The objects <code>a</code> and <code>b</code> compare as real numbers, so the answer is <code>False</code>, which is correct because 9 is smaller than 10. This is why you convert text to objects before you sort or compare. When you need text again, for example to print a message or write a file, use <code>str(a)</code>. The last line shows IPv6 works with the same function; <code>.version</code> is 6.</p>
<div class="warn"><p><b>Common mistake.</b> Using <code>ip_address</code> when you really have a subnet. <code>ip_address("10.60.7.0/26")</code> fails, because an address has no mask. Pick the object by asking: do I have a host, a subnet, or a host with its mask?</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the three names and what each holds. A typical question: "Which object represents 10.1.1.5/24 and exposes both the host and its subnet?" The answer is <code>ip_interface</code>.</p></div>
<div class="eg"><p><b>Worked example.</b> The inventory line <code>PUN-ACC-SW1,10.60.7.11,26</code> has an address and a prefix length. Glue them with a slash and you get <code>ip_interface("10.60.7.11/26")</code>. From it, <code>.network</code> tells you which subnet the switch is in without any hand calculation. Lab 2 uses exactly this idea.</p></div>
<div class="scn"><h4>Two engineers, one subnet, different answers</h4><p>Two engineers worked out the subnet of 10.60.7.12/26 by hand and wrote 10.60.7.0 and 10.60.7.12. The second forgot to zero the host bits. A script using <code>ip_interface("10.60.7.12/26").network</code> gave 10.60.7.0/26 for everyone and the sheet was corrected in a minute.</p><p><b>Lesson:</b> Let the module derive the subnet; do not type it twice.</p></div>
<div class="iv"><p class="q">"What is the difference between ip_address, ip_network and ip_interface?"</p><p><code>ip_address</code> is a single host such as 10.60.7.12. <code>ip_network</code> is a whole subnet such as 10.60.7.0/26 and the host bits must be zero. <code>ip_interface</code> is a host address together with its prefix, like a router port configuration, and gives <code>.ip</code> and <code>.network</code>. I also say that all three work for IPv4 and IPv6.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Three objects: address (host), network (subnet), interface (host plus mask).</li><li>A dot after a name reads an attribute, such as <code>.network</code> or <code>.version</code>.</li><li>Objects compare as numbers; strings compare as text and sort addresses wrongly.</li><li><code>str(obj)</code> gives the text back for printing or writing files.</li><li>The same objects handle IPv6.</li></ul></div>
`,hi:`
<p><b>Is chapter ka ek chhota idea:</b> module aapko teen alag "cheezein" deta hai, aur sahi cheez chunna aadha kaam hai. Ise postal system se compare karo. <b>Ghar ka number</b> ek address hai. <b>Gali</b> ghar numbers ka group hai. Aur "<b>Gandhi Road par ghar 12</b>" ghar ka number aur uski gali dono saath hain. Networking mein bhi yahi teen levels hain.</p>
<table class="cmp"><tr><th>Object</th><th>Matlab</th><th>Example text</th><th>Router analogy</th></tr><tr><td><code>ip_address</code></td><td>Ek host address</td><td>10.60.7.12</td><td>Network par ek device</td></tr><tr><td><code>ip_network</code></td><td>Poora subnet</td><td>10.60.7.0/26</td><td>VLAN ya subnet</td></tr><tr><td><code>ip_interface</code></td><td>Address aur uska mask</td><td>10.60.7.12/26</td><td>Router par "interface" ke neeche wali line</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="ip_address 10.60.7.12 to ip_network 10.60.7.0/26 to ip_interface 10.60.7.12/26"><rect x="20" y="40" width="177" height="76" rx="10" fill="#fde68a"/><text x="108.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">ip_address</text><text x="108.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">10.60.7.12</text><line x1="197" y1="78" x2="227" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="231,78 223,73 223,83" fill="#64748b"/><text x="214" y="70" text-anchor="middle" class="svg-accent" font-size="11">.ip</text><rect x="231" y="40" width="177" height="76" rx="10" fill="#bae6fd"/><text x="319.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">ip_network</text><text x="319.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">10.60.7.0/26</text><line x1="408" y1="78" x2="438" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="442,78 434,73 434,83" fill="#64748b"/><text x="425" y="70" text-anchor="middle" class="svg-accent" font-size="11">.network</text><rect x="442" y="40" width="177" height="76" rx="10" fill="#bbf7d0"/><text x="530.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">ip_interface</text><text x="530.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">10.60.7.12/26</text></svg><p class="cap">Interface object mein dono hain: uska .ip address hai aur .network subnet hai.</p></div>
<h3>Har object banana</h3>
<pre class="code">import ipaddress

ip = ipaddress.ip_address("10.60.7.12")
net = ipaddress.ip_network("10.60.7.0/26")
iface = ipaddress.ip_interface("10.60.7.12/26")

print(ip)
print(net)
print(iface)
print(iface.ip)
print(iface.network)
print(type(ip))</pre>
<p>Line by line: <code>ip_address("10.60.7.12")</code> text padhta hai aur address object banata hai. <code>ip_network("10.60.7.0/26")</code> subnet object banata hai. <code>ip_interface("10.60.7.12/26")</code> address aur mask ko saath rakhta hai, bilkul switch port ki <code>ip address 10.60.7.12 255.255.255.192</code> line ki tarah. Naam ke baad dot, jaise <code>iface.ip</code>, ka matlab hai "is object se uska ip naam ka hissa maango". Woh hissa <b>attribute</b> kehlata hai. <code>type(ip)</code> batata hai variable mein kis tarah ka object hai, jab aap sure nahi ho to kaam aata hai.</p>
<pre class="out">10.60.7.12
10.60.7.0/26
10.60.7.12/26
10.60.7.12
10.60.7.0/26
&lt;class 'ipaddress.IPv4Address'&gt;</pre>
<p>Dhyan do ki <code>iface.network</code> ne <code>10.60.7.0/26</code> print kiya jabki aapne yeh kabhi type nahi kiya. Python ne address aur mask se subnet nikaal liya. Yahi pehli baar hai jab module ne aapki manual calculation bachayi.</p>
<h3>Objects strings nahi hote</h3>
<pre class="code">import ipaddress

print("10.60.7.9" &gt; "10.60.7.10")
a = ipaddress.ip_address("10.60.7.9")
b = ipaddress.ip_address("10.60.7.10")
print(a &gt; b)
print(str(a) + " is the text form")
print(ipaddress.ip_address("2001:db8::1").version)</pre>
<pre class="out">True
False
10.60.7.9 is the text form
6</pre>
<p>Pehli line do <b>strings</b> compare karti hai. Text character by character compare hota hai, isliye <code>"9"</code>, <code>"1"</code> ke baad sort hota hai aur <code>"10.60.7.9"</code>, <code>"10.60.7.10"</code> se bada dikhta hai. Addresses ke liye yeh galat hai. Objects <code>a</code> aur <code>b</code> asli numbers ki tarah compare hote hain, isliye jawab <code>False</code> hai, jo sahi hai kyunki 9, 10 se chhota hai. Isiliye sort ya compare se pehle text ko objects mein badalte hain. Jab text wapas chahiye, jaise message print karna ya file likhna, to <code>str(a)</code> use karo. Aakhri line dikhati hai ki IPv6 usi function se chalta hai; <code>.version</code> 6 hai.</p>
<div class="warn"><p><b>Aam galti.</b> Jab asal mein subnet ho tab <code>ip_address</code> use karna. <code>ip_address("10.60.7.0/26")</code> fail hota hai, kyunki address ka mask nahi hota. Object chunne ke liye poochho: mere paas host hai, subnet hai, ya mask ke saath host?</p></div>
<div class="exam"><p><b>Exam trap.</b> Teeno naam aur har ek mein kya hai, yaad rakho. Typical sawaal: "10.1.1.5/24 ko kaunsa object represent karta hai jo host aur uska subnet dono dikhata hai?" Jawab <code>ip_interface</code> hai.</p></div>
<div class="eg"><p><b>Worked example.</b> Inventory line <code>PUN-ACC-SW1,10.60.7.11,26</code> mein address aur prefix length hai. Slash se jodo to <code>ip_interface("10.60.7.11/26")</code> milta hai. Isse <code>.network</code> batata hai ki switch kis subnet mein hai, bina haath ki calculation ke. Lab 2 bilkul yahi idea use karta hai.</p></div>
<div class="scn"><h4>Do engineers, ek subnet, alag jawab</h4><p>Do engineers ne 10.60.7.12/26 ka subnet haath se nikala aur 10.60.7.0 tatha 10.60.7.12 likha. Doosre ne host bits zero karna bhula diya. <code>ip_interface("10.60.7.12/26").network</code> use karne wali script ne sabko 10.60.7.0/26 diya aur sheet ek minute mein theek ho gayi.</p><p><b>Lesson:</b> Subnet module se nikalwao; use do baar type mat karo.</p></div>
<div class="iv"><p class="q">"ip_address, ip_network aur ip_interface mein kya difference hai?"</p><p><code>ip_address</code> ek single host hai jaise 10.60.7.12. <code>ip_network</code> poora subnet hai jaise 10.60.7.0/26 aur host bits zero hone chahiye. <code>ip_interface</code> host address aur uska prefix saath hai, router port configuration ki tarah, aur <code>.ip</code> tatha <code>.network</code> deta hai. Main yeh bhi bolta hoon ki teeno IPv4 aur IPv6 dono ke liye chalte hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Teen objects: address (host), network (subnet), interface (host aur mask).</li><li>Naam ke baad dot attribute padhta hai, jaise <code>.network</code> ya <code>.version</code>.</li><li>Objects numbers ki tarah compare hote hain; strings text ki tarah aur addresses galat sort karti hain.</li><li><code>str(obj)</code> printing ya file likhne ke liye text wapas deta hai.</li><li>Wahi objects IPv6 bhi handle karte hain.</li></ul></div>
`}};export{e as default};