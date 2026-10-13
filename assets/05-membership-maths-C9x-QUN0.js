var e={id:`membership-maths`,h:{en:`Is it inside? Comparing, adding and sorting addresses`,hi:`Kya yeh andar hai? Addresses compare, add aur sort karna`},body:{en:`
<p><b>One idea:</b> because addresses and networks are real objects, you can ask yes/no questions about them and do arithmetic on them, exactly as you do with numbers. Questions return <code>True</code> or <code>False</code> (called <b>booleans</b>). These answers drive the decisions in your scripts: "is this IP in the site block?", "do these two subnets overlap?".</p>
<h3>Membership and relationships</h3>
<pre class="code">import ipaddress

site = ipaddress.ip_network("10.60.4.0/22")
users = ipaddress.ip_network("10.60.4.0/23")
mgmt = ipaddress.ip_network("10.60.7.0/26")
sw = ipaddress.ip_address("10.60.7.12")

print(sw in mgmt)
print(sw in users)
print(users.subnet_of(site))
print(site.supernet_of(mgmt))
print(users.overlaps(mgmt))
print(site.overlaps(mgmt))</pre>
<pre class="out">True
False
True
True
False
True</pre>
<ul><li><code>sw in mgmt</code>: the word <code>in</code> asks "does this subnet contain this address?". The switch 10.60.7.12 is inside 10.60.7.0/26 and outside 10.60.4.0/23.</li><li><code>subnet_of</code> and <code>supernet_of</code> compare two networks. The /23 is a subnet of the /22; the /22 is a supernet of the /26.</li><li><code>overlaps</code> is true when two networks share any address. The /23 (10.60.4.0 to 5.255) and the /26 (10.60.7.0 to 7.63) do not overlap, but the /22 contains the /26. Overlap detection is how you find a double-booked subnet in a design.</li></ul>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Site /22 10.60.4.0 to 7.255 to USERS /23 10.60.4.0 to 5.255 to VOICE /24 10.60.6.0 to 6.255 to MGMT /26 10.60.7.0 to 7.63"><rect x="20" y="40" width="124" height="76" rx="10" fill="#bae6fd"/><text x="82" y="74" text-anchor="middle" class="svg-ink" font-size="13">Site /22</text><text x="82" y="90" text-anchor="middle" class="svg-muted" font-size="12">10.60.4.0 to 7.255</text><line x1="144" y1="78" x2="174" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="178,78 170,73 170,83" fill="#64748b"/><rect x="178" y="40" width="124" height="76" rx="10" fill="#bbf7d0"/><text x="240" y="74" text-anchor="middle" class="svg-ink" font-size="13">USERS /23</text><text x="240" y="90" text-anchor="middle" class="svg-muted" font-size="12">10.60.4.0 to 5.255</text><line x1="302" y1="78" x2="332" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="336,78 328,73 328,83" fill="#64748b"/><rect x="336" y="40" width="124" height="76" rx="10" fill="#fde68a"/><text x="398" y="74" text-anchor="middle" class="svg-ink" font-size="13">VOICE /24</text><text x="398" y="90" text-anchor="middle" class="svg-muted" font-size="12">10.60.6.0 to 6.255</text><line x1="460" y1="78" x2="490" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="494,78 486,73 486,83" fill="#64748b"/><rect x="494" y="40" width="124" height="76" rx="10" fill="#fed7aa"/><text x="556" y="74" text-anchor="middle" class="svg-ink" font-size="13">MGMT /26</text><text x="556" y="90" text-anchor="middle" class="svg-muted" font-size="12">10.60.7.0 to 7.63</text></svg><p class="cap">The /22 contains the three smaller subnets side by side. They do not overlap each other.</p></div>
<h3>Adding, subtracting and counting</h3>
<pre class="code">import ipaddress

gw = ipaddress.ip_network("10.60.7.0/26").network_address + 1
print(gw)
nxt = ipaddress.ip_network("10.60.4.0/23").broadcast_address + 1
print(nxt)
a = ipaddress.ip_address("10.60.7.200")
print(a - 150)
print(int(ipaddress.ip_address("0.0.1.0")))

ips = ["10.60.7.10", "10.60.7.9", "10.60.7.100", "10.60.7.2"]
print(sorted(ips))
print([str(x) for x in sorted(ipaddress.ip_address(i) for i in ips)])</pre>
<pre class="out">10.60.7.1
10.60.6.0
10.60.7.50
256
['10.60.7.10', '10.60.7.100', '10.60.7.2', '10.60.7.9']
['10.60.7.2', '10.60.7.9', '10.60.7.10', '10.60.7.100']</pre>
<p>Adding a whole number to an address moves forward by that many addresses: <code>network_address + 1</code> is the first usable address, and <code>broadcast_address + 1</code> is where the <i>next</i> subnet can begin. That second trick is how Lab 1 hands out subnets one after another. Subtracting a number moves backward. <code>int(address)</code> shows the address as one big whole number (here 256 for 0.0.1.0), which is how computers see it. The last two lines show why sorting needs objects: sorting the plain text puts 10.60.7.10 and 10.60.7.100 before 10.60.7.2, but sorting the objects gives the true numeric order. In <code>[str(x) for x in ...]</code> we build a new list by converting every item back to text.</p>
<h3>What kind of address is it?</h3>
<pre class="code">import ipaddress

for text in ["10.60.7.12", "172.16.5.1", "192.0.2.10", "127.0.0.1", "169.254.1.1", "8.8.8.8"]:
    a = ipaddress.ip_address(text)
    print(text, a.is_private, a.is_loopback, a.is_link_local, a.is_global)</pre>
<pre class="out">10.60.7.12 True False False False
172.16.5.1 True False False False
192.0.2.10 True False False False
127.0.0.1 True True False False
169.254.1.1 True False True False
8.8.8.8 False False False True</pre>
<p>Each flag answers a yes/no question. <code>is_private</code> covers RFC 1918 space plus other special-purpose ranges; <code>is_loopback</code> is 127.0.0.0/8; <code>is_link_local</code> is 169.254.0.0/16, the address a host gives itself when DHCP fails; <code>is_global</code> means "routable on the public internet". Be careful: <code>is_private</code> is also True for loopback, link-local and documentation addresses such as 192.0.2.10 (reserved for examples), so it does not mean "RFC 1918 only". Only 8.8.8.8 is True for <code>is_global</code> here. Real checks should use the flags rather than text matching such as "starts with 10.".</p>
<table class="cmp"><tr><th>Operator or method</th><th>Question or action</th><th>Returns</th></tr><tr><td><code>ip in net</code></td><td>Is the address inside the subnet?</td><td>True / False</td></tr><tr><td><code>a.subnet_of(b)</code></td><td>Is network a inside network b?</td><td>True / False</td></tr><tr><td><code>a.overlaps(b)</code></td><td>Do they share any address?</td><td>True / False</td></tr><tr><td><code>ip + 1</code></td><td>The next address</td><td>An address</td></tr><tr><td><code>sorted(objects)</code></td><td>True numeric order</td><td>A list</td></tr></table>
<div class="warn"><p><b>Common mistake.</b> Comparing a string to an object, such as <code>"10.60.7.12" in net</code>. A string is not an address object, so convert it first with <code>ip_address()</code>; otherwise Python stops with an <code>AttributeError</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>overlaps</code> is true for a network and any of its subnets (they share addresses). Two CIDR networks are either nested or completely separate, never partly overlapping. Use it to find duplicate allocations in an address plan.</p></div>
<div class="eg"><p><b>Worked example.</b> Lab 2 uses <code>if ip not in SITE</code> to flag any inventory address outside the Pune block 10.60.4.0/22. That is how <code>10.60.8.5</code> (the UPS) and the mistyped <code>10.60.7.300</code> are caught.</p></div>
<div class="scn"><h4>Two sites, one subnet</h4><p>A merger joined two companies. A script that looped over both address plans and called <code>overlaps</code> on every pair found that Pune and Nashik both used 10.60.7.0/26. The overlap would have broken the VPN between them. Planning a renumbering took a day; discovering it after the cutover would have taken a weekend.</p><p><b>Lesson:</b> Check overlaps across every pair before connecting networks.</p></div>
<div class="iv"><p class="q">"How would you check whether two subnets in a design overlap?"</p><p>Convert both to <code>ip_network</code> objects and call <code>a.overlaps(b)</code>. For a whole list, compare each pair with two loops. I also use <code>subnet_of</code> when I only want to know if a subnet is inside the allocated block. It is better than comparing strings because it understands prefix lengths.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li><code>in</code>, <code>subnet_of</code>, <code>supernet_of</code> and <code>overlaps</code> give True or False answers.</li><li><code>address + 1</code> moves forward; <code>broadcast_address + 1</code> is the start of the next subnet.</li><li>Sort objects, never text, to get true numeric order.</li><li>Use flags such as <code>is_private</code>, <code>is_loopback</code>, <code>is_link_local</code> and <code>is_global</code> instead of text matching.</li><li>Convert strings to objects before comparing them.</li></ul></div>
`,hi:`
<p><b>Ek idea:</b> kyunki addresses aur networks asli objects hain, aap unse yes/no sawaal pooch sakte ho aur numbers ki tarah arithmetic kar sakte ho. Sawaalon ka jawab <code>True</code> ya <code>False</code> hota hai (inhe <b>booleans</b> kehte hain). Yehi jawab aapki scripts ke decisions chalate hain: "kya yeh IP site block mein hai?", "kya yeh do subnets overlap karte hain?".</p>
<h3>Membership aur relationships</h3>
<pre class="code">import ipaddress

site = ipaddress.ip_network("10.60.4.0/22")
users = ipaddress.ip_network("10.60.4.0/23")
mgmt = ipaddress.ip_network("10.60.7.0/26")
sw = ipaddress.ip_address("10.60.7.12")

print(sw in mgmt)
print(sw in users)
print(users.subnet_of(site))
print(site.supernet_of(mgmt))
print(users.overlaps(mgmt))
print(site.overlaps(mgmt))</pre>
<pre class="out">True
False
True
True
False
True</pre>
<ul><li><code>sw in mgmt</code>: <code>in</code> word poochhta hai "kya is subnet mein yeh address hai?". Switch 10.60.7.12, 10.60.7.0/26 ke andar hai aur 10.60.4.0/23 ke bahar.</li><li><code>subnet_of</code> aur <code>supernet_of</code> do networks compare karte hain. /23, /22 ka subnet hai; /22, /26 ka supernet hai.</li><li><code>overlaps</code> tab true hota hai jab do networks koi bhi address share karte hain. /23 (10.60.4.0 se 5.255) aur /26 (10.60.7.0 se 7.63) overlap nahi karte, lekin /22 mein /26 shamil hai. Design mein double-book hua subnet isi overlap detection se milta hai.</li></ul>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Site /22 10.60.4.0 se 7.255 to USERS /23 10.60.4.0 se 5.255 to VOICE /24 10.60.6.0 se 6.255 to MGMT /26 10.60.7.0 se 7.63"><rect x="20" y="40" width="124" height="76" rx="10" fill="#bae6fd"/><text x="82" y="74" text-anchor="middle" class="svg-ink" font-size="13">Site /22</text><text x="82" y="90" text-anchor="middle" class="svg-muted" font-size="12">10.60.4.0 se 7.255</text><line x1="144" y1="78" x2="174" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="178,78 170,73 170,83" fill="#64748b"/><rect x="178" y="40" width="124" height="76" rx="10" fill="#bbf7d0"/><text x="240" y="74" text-anchor="middle" class="svg-ink" font-size="13">USERS /23</text><text x="240" y="90" text-anchor="middle" class="svg-muted" font-size="12">10.60.4.0 se 5.255</text><line x1="302" y1="78" x2="332" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="336,78 328,73 328,83" fill="#64748b"/><rect x="336" y="40" width="124" height="76" rx="10" fill="#fde68a"/><text x="398" y="74" text-anchor="middle" class="svg-ink" font-size="13">VOICE /24</text><text x="398" y="90" text-anchor="middle" class="svg-muted" font-size="12">10.60.6.0 se 6.255</text><line x1="460" y1="78" x2="490" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="494,78 486,73 486,83" fill="#64748b"/><rect x="494" y="40" width="124" height="76" rx="10" fill="#fed7aa"/><text x="556" y="74" text-anchor="middle" class="svg-ink" font-size="13">MGMT /26</text><text x="556" y="90" text-anchor="middle" class="svg-muted" font-size="12">10.60.7.0 se 7.63</text></svg><p class="cap">/22 mein teen chhote subnets saath-saath hain. Woh ek doosre se overlap nahi karte.</p></div>
<h3>Jodna, ghatana aur ginna</h3>
<pre class="code">import ipaddress

gw = ipaddress.ip_network("10.60.7.0/26").network_address + 1
print(gw)
nxt = ipaddress.ip_network("10.60.4.0/23").broadcast_address + 1
print(nxt)
a = ipaddress.ip_address("10.60.7.200")
print(a - 150)
print(int(ipaddress.ip_address("0.0.1.0")))

ips = ["10.60.7.10", "10.60.7.9", "10.60.7.100", "10.60.7.2"]
print(sorted(ips))
print([str(x) for x in sorted(ipaddress.ip_address(i) for i in ips)])</pre>
<pre class="out">10.60.7.1
10.60.6.0
10.60.7.50
256
['10.60.7.10', '10.60.7.100', '10.60.7.2', '10.60.7.9']
['10.60.7.2', '10.60.7.9', '10.60.7.10', '10.60.7.100']</pre>
<p>Address mein poora number jodne par woh utne addresses aage badhta hai: <code>network_address + 1</code> pehla usable address hai, aur <code>broadcast_address + 1</code> woh jagah hai jahan <i>agla</i> subnet shuru ho sakta hai. Yeh doosra trick Lab 1 mein subnets ek ke baad ek dene ke liye use hota hai. Number ghatane par peeche jaate hain. <code>int(address)</code> address ko ek bada poora number dikhata hai (yahan 0.0.1.0 ke liye 256), jaise computer use dekhta hai. Aakhri do lines dikhati hain ki sorting ke liye objects kyun chahiye: plain text sort 10.60.7.10 aur 10.60.7.100 ko 10.60.7.2 se pehle rakhta hai, jabki objects ka sort sahi numeric order deta hai. <code>[str(x) for x in ...]</code> mein hum har item ko text mein badalkar nayi list banate hain.</p>
<h3>Yeh kis tarah ka address hai?</h3>
<pre class="code">import ipaddress

for text in ["10.60.7.12", "172.16.5.1", "192.0.2.10", "127.0.0.1", "169.254.1.1", "8.8.8.8"]:
    a = ipaddress.ip_address(text)
    print(text, a.is_private, a.is_loopback, a.is_link_local, a.is_global)</pre>
<pre class="out">10.60.7.12 True False False False
172.16.5.1 True False False False
192.0.2.10 True False False False
127.0.0.1 True True False False
169.254.1.1 True False True False
8.8.8.8 False False False True</pre>
<p>Har flag ek yes/no sawaal ka jawab hai. <code>is_private</code> RFC 1918 space aur doosri special-purpose ranges cover karta hai; <code>is_loopback</code> 127.0.0.0/8 hai; <code>is_link_local</code> 169.254.0.0/16 hai, jo address host khud ko tab deta hai jab DHCP fail ho; <code>is_global</code> ka matlab "public internet par routable". Dhyan rakho: <code>is_private</code> loopback, link-local aur 192.0.2.10 jaise documentation addresses (examples ke liye reserved) ke liye bhi True hai, isliye iska matlab "sirf RFC 1918" nahi hai. Yahan sirf 8.8.8.8 <code>is_global</code> ke liye True hai. Asli checks mein flags use karo, "10. se shuru hota hai" jaisi text matching nahi.</p>
<table class="cmp"><tr><th>Operator ya method</th><th>Sawaal ya action</th><th>Deta hai</th></tr><tr><td><code>ip in net</code></td><td>Kya address subnet ke andar hai?</td><td>True / False</td></tr><tr><td><code>a.subnet_of(b)</code></td><td>Kya network a, network b ke andar hai?</td><td>True / False</td></tr><tr><td><code>a.overlaps(b)</code></td><td>Kya koi address common hai?</td><td>True / False</td></tr><tr><td><code>ip + 1</code></td><td>Agla address</td><td>Ek address</td></tr><tr><td><code>sorted(objects)</code></td><td>Sahi numeric order</td><td>Ek list</td></tr></table>
<div class="warn"><p><b>Aam galti.</b> String ko object se compare karna, jaise <code>"10.60.7.12" in net</code>. String address object nahi hai, isliye pehle <code>ip_address()</code> se convert karo; warna Python <code>AttributeError</code> ke saath ruk jaata hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>overlaps</code> network aur uske kisi bhi subnet ke liye true hota hai (woh addresses share karte hain). Do CIDR networks ya to ek-doosre ke andar hote hain ya bilkul alag, aadhe overlap nahi hote. Address plan mein duplicate allocations dhoondhne ke liye ise use karo.</p></div>
<div class="eg"><p><b>Worked example.</b> Lab 2 <code>if ip not in SITE</code> use karta hai taaki Pune block 10.60.4.0/22 ke bahar ka koi inventory address flag ho. Isi tarah <code>10.60.8.5</code> (UPS) aur galat type kiya hua <code>10.60.7.300</code> pakde jaate hain.</p></div>
<div class="scn"><h4>Do sites, ek subnet</h4><p>Merger mein do companies judi. Dono address plans par loop chalakar har pair par <code>overlaps</code> chalane wali script ne dikhaya ki Pune aur Nashik dono 10.60.7.0/26 use karte hain. Yeh overlap unke beech ka VPN tod deta. Renumbering plan karne mein ek din laga; cutover ke baad pata chalta to poora weekend lagta.</p><p><b>Lesson:</b> Networks jodne se pehle har pair ke overlaps check karo.</p></div>
<div class="iv"><p class="q">"Design ke do subnets overlap karte hain ya nahi, kaise check karoge?"</p><p>Dono ko <code>ip_network</code> objects mein badlo aur <code>a.overlaps(b)</code> chalao. Poori list ke liye do loops se har pair compare karo. Jab sirf yeh jaanna ho ki subnet allocated block ke andar hai, to <code>subnet_of</code> use karta hoon. Yeh strings compare karne se behtar hai kyunki yeh prefix lengths samajhta hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li><code>in</code>, <code>subnet_of</code>, <code>supernet_of</code> aur <code>overlaps</code> True ya False jawab dete hain.</li><li><code>address + 1</code> aage badhta hai; <code>broadcast_address + 1</code> agle subnet ki shuruaat hai.</li><li>True numeric order ke liye objects sort karo, text kabhi nahi.</li><li>Text matching ki jagah <code>is_private</code>, <code>is_loopback</code>, <code>is_link_local</code> aur <code>is_global</code> jaise flags use karo.</li><li>Compare karne se pehle strings ko objects mein badlo.</li></ul></div>
`}};export{e as default};