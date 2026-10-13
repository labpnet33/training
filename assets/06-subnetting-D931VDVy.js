var e={id:`subnetting`,h:{en:`Carving a block into subnets`,hi:`Block ko subnets mein kaatna`},body:{en:`
<p><b>One idea:</b> the module can split a network into smaller ones, join small ones into a bigger one, and cut a piece out of a network. This is the real "work" of subnet planning, and you will now finish it in seconds instead of an afternoon.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Site block 10.60.4.0/22 to subnets() split into pieces to Plan one subnet per need"><rect x="20" y="40" width="177" height="76" rx="10" fill="#bae6fd"/><text x="108.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">Site block</text><text x="108.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">10.60.4.0/22</text><line x1="197" y1="78" x2="227" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="231,78 223,73 223,83" fill="#64748b"/><rect x="231" y="40" width="177" height="76" rx="10" fill="#bbf7d0"/><text x="319.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">subnets()</text><text x="319.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">split into pieces</text><line x1="408" y1="78" x2="438" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="442,78 434,73 434,83" fill="#64748b"/><rect x="442" y="40" width="177" height="76" rx="10" fill="#ddd6fe"/><text x="530.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">Plan</text><text x="530.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">one subnet per need</text></svg><p class="cap">Splitting is like cutting a chocolate bar along its grooves: every piece is the same size unless you plan otherwise.</p></div>
<h3>Splitting and joining</h3>
<pre class="code">import ipaddress

block = ipaddress.ip_network("10.60.4.0/22")
for sub in block.subnets(new_prefix=24):
    print(sub)
print(list(block.subnets(prefixlen_diff=1)))
print(ipaddress.ip_network("10.60.7.0/26").supernet())
print(ipaddress.ip_network("10.60.7.0/26").supernet(new_prefix=22))</pre>
<pre class="out">10.60.4.0/24
10.60.5.0/24
10.60.6.0/24
10.60.7.0/24
[IPv4Network('10.60.4.0/23'), IPv4Network('10.60.6.0/23')]
10.60.7.0/25
10.60.4.0/22</pre>
<p><code>subnets(new_prefix=24)</code> cuts the /22 into /24 pieces and the <code>for</code> loop prints each one: the four /24s are 10.60.4.0, 10.60.5.0, 10.60.6.0 and 10.60.7.0. <code>prefixlen_diff=1</code> means "make the prefix one bit longer", so a /22 becomes two /23s. <code>supernet()</code> goes the other way: it returns the next bigger network that contains this one, or a specific size with <code>new_prefix</code>. Remember that a longer prefix means a smaller subnet.</p>
<h3>Cutting out a piece and tidying a list</h3>
<pre class="code">import ipaddress

whole = ipaddress.ip_network("10.60.4.0/22")
used = ipaddress.ip_network("10.60.7.0/26")
for piece in whole.address_exclude(used):
    print(piece)

nets = [ipaddress.ip_network("10.60.4.0/24"), ipaddress.ip_network("10.60.5.0/24"), ipaddress.ip_network("10.60.6.0/25")]
print(list(ipaddress.collapse_addresses(nets)))</pre>
<pre class="out">10.60.4.0/23
10.60.6.0/24
10.60.7.128/25
10.60.7.64/26
[IPv4Network('10.60.4.0/23'), IPv4Network('10.60.6.0/25')]</pre>
<p><code>address_exclude</code> answers "what is left of the big block after I give away this piece?" and returns the leftover networks, which are always aligned on proper boundaries. <code>collapse_addresses</code> does the reverse for routing summaries: it merges neighbouring networks into the fewest possible prefixes. The two /24s merge into one /23, and the /25 stays separate because it cannot merge with anything. This is how you build a summary route from a list of site subnets.</p>
<h3>The planner from Lab 1, explained line by line</h3>
<p>Here is the heart of <code>plan.py</code>. It gives each requirement the next free subnet, biggest first. The program is short, but it uses everything from the earlier chapters.</p>
<pre class="code">import ipaddress

BLOCK = "10.60.4.0/22"
NEEDS = [("USERS", 23), ("VOICE", 24), ("MGMT", 26)]


def allocate(block, needs):
    """give each need the next free subnet, biggest first"""
    plan = []
    nxt = block.network_address
    for name, prefix in sorted(needs, key=lambda n: n[1]):
        net = ipaddress.ip_network(f"{nxt}/{prefix}")
        if not net.subnet_of(block):
            raise SystemExit(f"{name}: no room left in {block}")
        plan.append((name, net))
        nxt = net.broadcast_address + 1
    return plan


block = ipaddress.ip_network(BLOCK)
plan = allocate(block, NEEDS)
print(f"{'NAME':&lt;8} {'SUBNET':&lt;16} {'GATEWAY':&lt;14} USABLE")
for name, net in plan:
    gw = net.network_address + 1
    usable = net.num_addresses - 2
    print(f"{name:&lt;8} {str(net):&lt;16} {str(gw):&lt;14} {usable}")
print(f"next free address: {plan[-1][1].broadcast_address + 1}")</pre>
<pre class="out">NAME     SUBNET           GATEWAY        USABLE
USERS    10.60.4.0/23     10.60.4.1      510
VOICE    10.60.6.0/24     10.60.6.1      254
MGMT     10.60.7.0/26     10.60.7.1      62
next free address: 10.60.7.64</pre>
<ul><li><code>NEEDS</code> is a list of pairs: a name and the prefix length wanted. <code>sorted(..., key=lambda n: n[1])</code> sorts the pairs by the second item (the prefix). Smaller prefix number means bigger subnet, so the /23 goes first. <code>lambda</code> is a tiny nameless function; here it simply means "for each pair n, use n[1]".</li><li><code>nxt</code> remembers where the next subnet may start. It begins at the block's first address. After each subnet, <code>nxt = net.broadcast_address + 1</code> moves it to the address just past the end.</li><li><code>f"{nxt}/{prefix}"</code> is an <b>f-string</b>: a string that starts with <code>f</code> and inserts the values of the names inside curly braces. If <code>nxt</code> is 10.60.6.0 and <code>prefix</code> is 24 you get the text 10.60.6.0/24.</li><li><code>if not net.subnet_of(block): raise SystemExit(...)</code> stops the program with a clear message when the block is too small. A planner that quietly allocated outside the block would be dangerous.</li><li><code>{'NAME':&lt;8}</code> inside an f-string pads the text to 8 characters, left-aligned, so the columns line up. <code>plan[-1][1]</code> is the network of the last pair.</li></ul>
<p>The output is a real run of this code. USERS (/23) starts at the block start, VOICE (/24) follows at 10.60.6.0, and MGMT (/26) comes next at 10.60.7.0. Free space remains from 10.60.7.64. In Lab 1 you add a fourth need, CCTV, and it lands at 10.60.7.64/26.</p>
<div class="warn"><p><b>Common mistake.</b> Giving the small subnet first. If a /26 comes before the /23 the next /23 cannot start in the middle of the third octet and the planner would have to skip addresses, or fail the <code>subnet_of</code> test. Always sort biggest first.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the direction: <code>subnets()</code> makes smaller networks (longer prefix), <code>supernet()</code> makes a bigger one (shorter prefix), and <code>collapse_addresses</code> summarises.</p></div>
<div class="scn"><h4>Summary route in one line</h4><p>A WAN team had 14 site subnets in a spreadsheet and needed the smallest set of routes to advertise. By hand it took two people half a day and still had a mistake. <code>collapse_addresses</code> returned the minimal list in one call and a second check confirmed that every original subnet was inside one of the summaries.</p><p><b>Lesson:</b> Let the library summarise, then verify with subnet_of.</p></div>
<div class="iv"><p class="q">"How would you allocate subnets of different sizes from one block in Python?"</p><p>I sort the requirements by prefix length so the biggest subnet goes first, keep a pointer to the next free address, create each subnet with <code>ip_network</code>, check it is inside the block with <code>subnet_of</code>, then move the pointer to <code>broadcast_address + 1</code>. Biggest-first avoids alignment gaps. I stop with a clear error if the block runs out.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li><code>subnets(new_prefix=N)</code> splits; <code>supernet()</code> joins upward; <code>address_exclude</code> cuts out a piece; <code>collapse_addresses</code> summarises.</li><li>Allocate biggest subnets first so every subnet sits on its boundary.</li><li><code>broadcast_address + 1</code> is the next free address after a subnet.</li><li>An f-string inserts values into text with curly braces.</li><li>Fail loudly when the block is full.</li></ul></div>
`,hi:`
<p><b>Ek idea:</b> module network ko chhote networks mein baant sakta hai, chhote networks ko bade mein jod sakta hai, aur network ka ek tukda kaat sakta hai. Subnet planning ka asli "kaam" yahi hai, aur ab aap ise ek dopahar ki jagah kuch seconds mein khatam karoge.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Site block 10.60.4.0/22 to subnets() tukdon mein baanto to Plan har need ka ek subnet"><rect x="20" y="40" width="177" height="76" rx="10" fill="#bae6fd"/><text x="108.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">Site block</text><text x="108.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">10.60.4.0/22</text><line x1="197" y1="78" x2="227" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="231,78 223,73 223,83" fill="#64748b"/><rect x="231" y="40" width="177" height="76" rx="10" fill="#bbf7d0"/><text x="319.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">subnets()</text><text x="319.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">tukdon mein baanto</text><line x1="408" y1="78" x2="438" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="442,78 434,73 434,83" fill="#64748b"/><rect x="442" y="40" width="177" height="76" rx="10" fill="#ddd6fe"/><text x="530.5" y="74" text-anchor="middle" class="svg-ink" font-size="13">Plan</text><text x="530.5" y="90" text-anchor="middle" class="svg-muted" font-size="12">har need ka ek subnet</text></svg><p class="cap">Baantna chocolate bar ko uski lines par todne jaisa hai: har tukda barabar hota hai jab tak aap alag plan na karo.</p></div>
<h3>Baantna aur jodna</h3>
<pre class="code">import ipaddress

block = ipaddress.ip_network("10.60.4.0/22")
for sub in block.subnets(new_prefix=24):
    print(sub)
print(list(block.subnets(prefixlen_diff=1)))
print(ipaddress.ip_network("10.60.7.0/26").supernet())
print(ipaddress.ip_network("10.60.7.0/26").supernet(new_prefix=22))</pre>
<pre class="out">10.60.4.0/24
10.60.5.0/24
10.60.6.0/24
10.60.7.0/24
[IPv4Network('10.60.4.0/23'), IPv4Network('10.60.6.0/23')]
10.60.7.0/25
10.60.4.0/22</pre>
<p><code>subnets(new_prefix=24)</code> /22 ko /24 tukdon mein kaatta hai aur <code>for</code> loop har ek print karta hai: chaar /24 hain 10.60.4.0, 10.60.5.0, 10.60.6.0 aur 10.60.7.0. <code>prefixlen_diff=1</code> ka matlab "prefix ek bit lamba karo", isliye /22 do /23 ban jaata hai. <code>supernet()</code> ulta karta hai: yeh agla bada network deta hai jisme yeh aata hai, ya <code>new_prefix</code> se khaas size. Yaad rakho ki lamba prefix matlab chhota subnet.</p>
<h3>Ek tukda kaatna aur list saaf karna</h3>
<pre class="code">import ipaddress

whole = ipaddress.ip_network("10.60.4.0/22")
used = ipaddress.ip_network("10.60.7.0/26")
for piece in whole.address_exclude(used):
    print(piece)

nets = [ipaddress.ip_network("10.60.4.0/24"), ipaddress.ip_network("10.60.5.0/24"), ipaddress.ip_network("10.60.6.0/25")]
print(list(ipaddress.collapse_addresses(nets)))</pre>
<pre class="out">10.60.4.0/23
10.60.6.0/24
10.60.7.128/25
10.60.7.64/26
[IPv4Network('10.60.4.0/23'), IPv4Network('10.60.6.0/25')]</pre>
<p><code>address_exclude</code> poochhta hai "bade block se yeh tukda dene ke baad kya bacha?" aur bacha hua networks deta hai, jo hamesha sahi boundaries par hote hain. <code>collapse_addresses</code> routing summaries ke liye ulta karta hai: padosi networks ko kam se kam prefixes mein merge karta hai. Do /24 mil kar ek /23 ban jaate hain, aur /25 alag rehta hai kyunki woh kisi se merge nahi ho sakta. Site subnets ki list se summary route yahin se banta hai.</p>
<h3>Lab 1 ka planner, line by line samjha hua</h3>
<p>Yeh <code>plan.py</code> ka dil hai. Yeh har requirement ko agla free subnet deta hai, sabse bada pehle. Program chhota hai, lekin pichhle chapters ki har cheez isme use hui hai.</p>
<pre class="code">import ipaddress

BLOCK = "10.60.4.0/22"
NEEDS = [("USERS", 23), ("VOICE", 24), ("MGMT", 26)]


def allocate(block, needs):
    """give each need the next free subnet, biggest first"""
    plan = []
    nxt = block.network_address
    for name, prefix in sorted(needs, key=lambda n: n[1]):
        net = ipaddress.ip_network(f"{nxt}/{prefix}")
        if not net.subnet_of(block):
            raise SystemExit(f"{name}: no room left in {block}")
        plan.append((name, net))
        nxt = net.broadcast_address + 1
    return plan


block = ipaddress.ip_network(BLOCK)
plan = allocate(block, NEEDS)
print(f"{'NAME':&lt;8} {'SUBNET':&lt;16} {'GATEWAY':&lt;14} USABLE")
for name, net in plan:
    gw = net.network_address + 1
    usable = net.num_addresses - 2
    print(f"{name:&lt;8} {str(net):&lt;16} {str(gw):&lt;14} {usable}")
print(f"next free address: {plan[-1][1].broadcast_address + 1}")</pre>
<pre class="out">NAME     SUBNET           GATEWAY        USABLE
USERS    10.60.4.0/23     10.60.4.1      510
VOICE    10.60.6.0/24     10.60.6.1      254
MGMT     10.60.7.0/26     10.60.7.1      62
next free address: 10.60.7.64</pre>
<ul><li><code>NEEDS</code> pairs ki list hai: naam aur chahiya hua prefix length. <code>sorted(..., key=lambda n: n[1])</code> pairs ko doosre item (prefix) se sort karta hai. Chhota prefix number matlab bada subnet, isliye /23 pehle aata hai. <code>lambda</code> ek chhota bina naam ka function hai; yahan matlab "har pair n ke liye n[1] lo".</li><li><code>nxt</code> yaad rakhta hai ki agla subnet kahan se shuru ho sakta hai. Yeh block ke pehle address se shuru hota hai. Har subnet ke baad <code>nxt = net.broadcast_address + 1</code> use end ke thik baad wale address par le jaata hai.</li><li><code>f"{nxt}/{prefix}"</code> ek <b>f-string</b> hai: <code>f</code> se shuru hone wali string jo curly braces ke andar ke names ki values daal deti hai. <code>nxt</code> 10.60.6.0 aur <code>prefix</code> 24 ho to text 10.60.6.0/24 milta hai.</li><li><code>if not net.subnet_of(block): raise SystemExit(...)</code> block bahut chhota hone par saaf message ke saath program rok deta hai. Block ke bahar chupchaap allocate karne wala planner khatarnak hota.</li><li>f-string ke andar <code>{'NAME':&lt;8}</code> text ko 8 characters tak pad karta hai, left-aligned, taaki columns seedhe rahein. <code>plan[-1][1]</code> aakhri pair ka network hai.</li></ul>
<p>Output is code ka asli run hai. USERS (/23) block ki shuruaat par hai, VOICE (/24) 10.60.6.0 par aata hai, aur MGMT (/26) 10.60.7.0 par. Free space 10.60.7.64 se bachi hai. Lab 1 mein aap chauthi need, CCTV, jodte ho aur woh 10.60.7.64/26 par aata hai.</p>
<div class="warn"><p><b>Aam galti.</b> Chhota subnet pehle dena. Agar /26, /23 se pehle aaye to agla /23 teesre octet ke beech mein shuru nahi ho sakta aur planner ko addresses chhodne padte hain, ya <code>subnet_of</code> test fail hota hai. Hamesha bada pehle sort karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Direction yaad rakho: <code>subnets()</code> chhote networks (lamba prefix) banata hai, <code>supernet()</code> bada (chhota prefix) banata hai, aur <code>collapse_addresses</code> summarise karta hai.</p></div>
<div class="scn"><h4>Ek line mein summary route</h4><p>WAN team ke paas spreadsheet mein 14 site subnets the aur advertise karne ke liye sabse chhota route set chahiye tha. Haath se do logon ko aadha din laga aur phir bhi ek galti thi. <code>collapse_addresses</code> ne ek call mein minimal list di aur doosre check ne confirm kiya ki har original subnet kisi summary ke andar tha.</p><p><b>Lesson:</b> Library se summarise karwao, phir subnet_of se verify karo.</p></div>
<div class="iv"><p class="q">"Ek block se alag-alag size ke subnets Python mein kaise allocate karoge?"</p><p>Main requirements ko prefix length se sort karta hoon taaki sabse bada subnet pehle aaye, agle free address ka pointer rakhta hoon, har subnet <code>ip_network</code> se banata hoon, <code>subnet_of</code> se check karta hoon ki woh block ke andar hai, phir pointer ko <code>broadcast_address + 1</code> par le jaata hoon. Bada-pehle alignment gaps se bachata hai. Block khatam ho jaaye to saaf error ke saath ruk jaata hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li><code>subnets(new_prefix=N)</code> baantta hai; <code>supernet()</code> upar jodta hai; <code>address_exclude</code> tukda kaatta hai; <code>collapse_addresses</code> summarise karta hai.</li><li>Sabse bade subnets pehle allocate karo taaki har subnet apni boundary par rahe.</li><li><code>broadcast_address + 1</code> subnet ke baad ka agla free address hai.</li><li>f-string curly braces se text mein values daalti hai.</li><li>Block bhar jaaye to zor se fail karo.</li></ul></div>
`}};export{e as default};