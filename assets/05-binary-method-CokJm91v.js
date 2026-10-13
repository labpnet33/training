var e={id:`binary-method`,h:{en:`Network, first, last and broadcast: the binary method`,hi:`Network, first, last aur broadcast: binary method`},body:{en:`
<p>Picture a street with numbered houses. The sign at the start of the street carries the street's name; nobody lives in it. A loudspeaker at the far end reaches every house at once; nobody lives there either. Everyone else lives in between. Every subnet has the same shape: a <b>network address</b> (the street sign), a <b>broadcast address</b> (the loudspeaker), and the <b>usable host addresses</b> in between. This chapter teaches the method that always gives the right answer: binary. Chapter 6 then teaches the fast shortcut.</p>

<h3>The four numbers</h3>
<dl class="terms">
<dt>Network address</dt><dd>All host bits set to <b>0</b>. It names the subnet and appears in routing tables. It cannot be assigned to a host.</dd>
<dt>Broadcast address</dt><dd>All host bits set to <b>1</b>. A packet sent to it reaches every host in the subnet. It cannot be assigned to a host.</dd>
<dt>First usable</dt><dd>Network address + 1. By convention often the default gateway, as in Lab 1 where routers take the first usable.</dd>
<dt>Last usable</dt><dd>Broadcast address − 1. In Lab 1 the PCs take the last usable.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Host bits zero and one">
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="14">192.168.50.77 /26, fourth octet only</text>
<rect x="60" y="40" width="120" height="36" rx="6" fill="#bae6fd"/><text x="120" y="63" text-anchor="middle" class="svg-ink" font-size="13">01</text>
<rect x="180" y="40" width="360" height="36" rx="6" fill="#bbf7d0"/><text x="360" y="63" text-anchor="middle" class="svg-ink" font-size="13">001101 (host bits)</text>
<text x="590" y="63" text-anchor="middle" class="svg-muted" font-size="12">= 77</text>
<rect x="60" y="90" width="120" height="36" rx="6" fill="#bae6fd"/><text x="120" y="113" text-anchor="middle" class="svg-ink" font-size="13">01</text>
<rect x="180" y="90" width="360" height="36" rx="6" fill="#e2e8f0"/><text x="360" y="113" text-anchor="middle" class="svg-ink" font-size="13">000000 (all zero)</text>
<text x="590" y="113" text-anchor="middle" class="svg-accent" font-size="12">net 64</text>
<rect x="60" y="140" width="120" height="36" rx="6" fill="#bae6fd"/><text x="120" y="163" text-anchor="middle" class="svg-ink" font-size="13">01</text>
<rect x="180" y="140" width="360" height="36" rx="6" fill="#fde68a"/><text x="360" y="163" text-anchor="middle" class="svg-ink" font-size="13">111111 (all one)</text>
<text x="590" y="163" text-anchor="middle" class="svg-accent" font-size="12">bcast 127</text>
</svg><p class="cap">Keep the network bits, then set the host bits all to 0 for the network address and all to 1 for the broadcast.</p></div>

<h3>The method, step by step</h3>
<ol>
<li>Find the <b>interesting octet</b>: the one where the mask is neither 255 nor 0.</li>
<li>Octets before it (mask 255) are copied unchanged. Octets after it (mask 0) will be 0 in the network address and 255 in the broadcast.</li>
<li>Write the interesting octet of the address and of the mask in binary, and AND them. That is the network value.</li>
<li>Set the host bits of that octet to 1 to get the broadcast value.</li>
<li>First usable = network + 1; last usable = broadcast − 1 (applied to the whole address).</li>
</ol>

<div class="eg"><p><b>Worked example 1: 192.168.50.77/26.</b> Mask 255.255.255.192, interesting octet is the fourth.</p>
<pre class="out">address  77  = 01|001101
mask    192  = 11|000000
AND          = 01|000000 = 64    network   192.168.50.64
host bits 1  = 01|111111 = 127   broadcast 192.168.50.127
first usable 192.168.50.65   last usable 192.168.50.126</pre></div>

<div class="eg"><p><b>Worked example 2: 172.16.45.77/27.</b> Mask 255.255.255.224.</p>
<pre class="out">address  77  = 010|01101
mask    224  = 111|00000
AND          = 010|00000 = 64    network   172.16.45.64
host bits 1  = 010|11111 = 95    broadcast 172.16.45.95
usable 172.16.45.65 to 172.16.45.94</pre></div>

<div class="eg"><p><b>Worked example 3: 10.1.10.200/22.</b> Mask 255.255.252.0, interesting octet is the <b>third</b>. The fourth octet becomes 0 or 255.</p>
<pre class="out">3rd octet 10  = 000010|10
mask     252  = 111111|00
AND           = 000010|00 = 8     network   10.1.8.0
host bits 1   = 000010|11 = 11    broadcast 10.1.11.255
first usable 10.1.8.1   last usable 10.1.11.254</pre>
<p>Notice that 10.1.9.0 and 10.1.10.255 are ordinary host addresses in this subnet. Zeros and 255s in the middle of a big subnet are fine.</p></div>

<div class="eg"><p><b>Worked example 4: the troubleshooting lab.</b> The office should be 10.20.30.0/26, but R1 was given 10.20.30.1 with 255.255.255.240 (/28). With /28 the host bits are the last 4: 1 = <code>0000|0001</code>, so the network is 10.20.30.0 and the broadcast is <code>0000|1111</code> = 10.20.30.15. R1 believes its LAN ends at .15, so PC2 at .50 is not on R1's wire. With the correct /26 the broadcast is <code>00|111111</code> = .63 and .50 fits.</p></div>

<h3>What the router shows</h3>
<p>A router computes the network address for you when you configure an interface. <code>show ip route connected</code> lists the <b>C</b> (connected network) and <b>L</b> (local /32 host) routes:</p>
<pre class="out">R1# show ip route connected
      10.0.0.0/8 is variably subnetted, 4 subnets, 3 masks
C        10.0.0.0/30 is directly connected, GigabitEthernet0/0
L        10.0.0.1/32 is directly connected, GigabitEthernet0/0
<span class="hl">C        10.20.30.0/28 is directly connected, GigabitEthernet0/1</span>
L        10.20.30.1/32 is directly connected, GigabitEthernet0/1</pre>
<p>That highlighted /28 is the fault in the troubleshooting lab: the connected route is smaller than the real office subnet.</p>

<h3>Practice drills (answers below)</h3>
<p>Find network, first, last and broadcast: <b>a)</b> 192.168.1.100/27 <b>b)</b> 10.0.0.19/29 <b>c)</b> 172.20.130.5/17 <b>d)</b> 192.0.2.66/30.</p>
<div class="tip"><p><b>Answers.</b> a) 100 = 011|00100 → net 192.168.1.96, first .97, last .126, bcast .127. b) 19 = 00010|011 → net 10.0.0.16, first .17, last .22, bcast .23. c) third octet 130 = 1|0000010 → net 172.20.128.0, first 172.20.128.1, last 172.20.255.254, bcast 172.20.255.255. d) 66 = 010000|10 → net 192.0.2.64, usable .65 and .66, bcast .67.</p></div>

<div class="warn"><p><b>Common mistake.</b> Working only on the interesting octet and forgetting the octets after it. The broadcast of 10.1.8.0/22 is 10.1.11.<b>255</b>, not 10.1.11.0. The first usable of 172.20.128.0/17 is 172.20.128.1, not 172.20.129.0.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Which of these is a valid host address?" Compute the network and broadcast for each option; the options that equal either one are the traps. In 10.1.8.0/22, 10.1.10.0 is valid and 10.1.11.255 is not.</p></div>

<div class="scn"><h4>"Bad mask" at 2 a.m.</h4><p>During a night change, an engineer tried to give R2's new LAN interface the address 192.168.50.64 with mask 255.255.255.192, copying the subnet name from the design sheet. IOS refused with <code>Bad mask /26 for address 192.168.50.64</code>. He thought the router was broken and lost 20 minutes. The message means the address is the network address of that /26 (all host bits 0), so it cannot sit on an interface. The design intended the first usable, 192.168.50.65.</p><p><b>Lesson:</b> subnet names in a design sheet are network addresses. Interfaces get usable addresses.</p></div>

<div class="iv"><p class="q">"Give me the network, broadcast and usable range for 172.16.45.77/27, and show how you got it."</p><p>Strong answer: the mask is 255.255.255.224, the interesting octet is the fourth; 77 is 01001101, AND with 11100000 gives 01000000 = 64, so the network is 172.16.45.64; host bits all 1 give 01011111 = 95, the broadcast; usable is .65 to .94, 30 hosts. Then mention the faster check: a /27 is a block of 32, 77 falls between 64 and 96, same answer.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Network = host bits all 0; broadcast = host bits all 1; neither can be assigned to a host.</li>
<li>First usable = network + 1; last usable = broadcast − 1.</li>
<li>Work in binary only on the interesting octet; earlier octets copy, later octets become 0 or 255.</li>
<li>Routers show the result as C (connected network) and L (local /32) routes.</li>
<li>"Bad mask /n for address" means you tried to assign a network (or broadcast) address.</li>
</ul></div>
`,hi:`
<p>Numbered gharon wali ek street socho. Street ki shuruaat mein laga board street ka naam batata hai; usmein koi nahi rehta. Door wale end par ek loudspeaker ek saath har ghar tak pahunchta hai; wahan bhi koi nahi rehta. Baaki sab beech mein rehte hain. Har subnet ki shape yahi hai: ek <b>network address</b> (street board), ek <b>broadcast address</b> (loudspeaker), aur beech mein <b>usable host addresses</b>. Yeh chapter woh method sikhata hai jo hamesha sahi answer deta hai: binary. Chapter 6 phir tez shortcut sikhata hai.</p>

<h3>Chaar numbers</h3>
<dl class="terms">
<dt>Network address</dt><dd>Saare host bits <b>0</b>. Yeh subnet ka naam hai aur routing tables mein dikhta hai. Ise host ko assign nahi kar sakte.</dd>
<dt>Broadcast address</dt><dd>Saare host bits <b>1</b>. Is par bheja packet subnet ke har host tak pahunchta hai. Ise host ko assign nahi kar sakte.</dd>
<dt>First usable</dt><dd>Network address + 1. Convention se aksar default gateway, jaise Lab 1 mein jahan routers pehla usable lete hain.</dd>
<dt>Last usable</dt><dd>Broadcast address − 1. Lab 1 mein PCs aakhri usable lete hain.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="Host bits zero aur one">
<text x="320" y="22" text-anchor="middle" class="svg-ink" font-size="14">192.168.50.77 /26, sirf fourth octet</text>
<rect x="60" y="40" width="120" height="36" rx="6" fill="#bae6fd"/><text x="120" y="63" text-anchor="middle" class="svg-ink" font-size="13">01</text>
<rect x="180" y="40" width="360" height="36" rx="6" fill="#bbf7d0"/><text x="360" y="63" text-anchor="middle" class="svg-ink" font-size="13">001101 (host bits)</text>
<text x="590" y="63" text-anchor="middle" class="svg-muted" font-size="12">= 77</text>
<rect x="60" y="90" width="120" height="36" rx="6" fill="#bae6fd"/><text x="120" y="113" text-anchor="middle" class="svg-ink" font-size="13">01</text>
<rect x="180" y="90" width="360" height="36" rx="6" fill="#e2e8f0"/><text x="360" y="113" text-anchor="middle" class="svg-ink" font-size="13">000000 (sab zero)</text>
<text x="590" y="113" text-anchor="middle" class="svg-accent" font-size="12">net 64</text>
<rect x="60" y="140" width="120" height="36" rx="6" fill="#bae6fd"/><text x="120" y="163" text-anchor="middle" class="svg-ink" font-size="13">01</text>
<rect x="180" y="140" width="360" height="36" rx="6" fill="#fde68a"/><text x="360" y="163" text-anchor="middle" class="svg-ink" font-size="13">111111 (sab one)</text>
<text x="590" y="163" text-anchor="middle" class="svg-accent" font-size="12">bcast 127</text>
</svg><p class="cap">Network bits rakho, phir network address ke liye host bits sab 0 aur broadcast ke liye sab 1 kar do.</p></div>

<h3>Method, step by step</h3>
<ol>
<li><b>Interesting octet</b> dhoondo: jahan mask na 255 hai na 0.</li>
<li>Usse pehle ke octets (mask 255) bina badle copy hote hain. Uske baad ke octets (mask 0) network address mein 0 aur broadcast mein 255 honge.</li>
<li>Address aur mask ke interesting octet ko binary mein likho, aur AND karo. Wahi network value hai.</li>
<li>Broadcast value ke liye us octet ke host bits ko 1 kar do.</li>
<li>First usable = network + 1; last usable = broadcast − 1 (poore address par lagao).</li>
</ol>

<div class="eg"><p><b>Worked example 1: 192.168.50.77/26.</b> Mask 255.255.255.192, interesting octet fourth hai.</p>
<pre class="out">address  77  = 01|001101
mask    192  = 11|000000
AND          = 01|000000 = 64    network   192.168.50.64
host bits 1  = 01|111111 = 127   broadcast 192.168.50.127
first usable 192.168.50.65   last usable 192.168.50.126</pre></div>

<div class="eg"><p><b>Worked example 2: 172.16.45.77/27.</b> Mask 255.255.255.224.</p>
<pre class="out">address  77  = 010|01101
mask    224  = 111|00000
AND          = 010|00000 = 64    network   172.16.45.64
host bits 1  = 010|11111 = 95    broadcast 172.16.45.95
usable 172.16.45.65 to 172.16.45.94</pre></div>

<div class="eg"><p><b>Worked example 3: 10.1.10.200/22.</b> Mask 255.255.252.0, interesting octet <b>third</b> hai. Fourth octet 0 ya 255 ban jaata hai.</p>
<pre class="out">3rd octet 10  = 000010|10
mask     252  = 111111|00
AND           = 000010|00 = 8     network   10.1.8.0
host bits 1   = 000010|11 = 11    broadcast 10.1.11.255
first usable 10.1.8.1   last usable 10.1.11.254</pre>
<p>Dhyan do ki 10.1.9.0 aur 10.1.10.255 is subnet mein normal host addresses hain. Bade subnet ke beech mein zeros aur 255s bilkul theek hain.</p></div>

<div class="eg"><p><b>Worked example 4: troubleshooting lab.</b> Office 10.20.30.0/26 hona chahiye, par R1 ko 10.20.30.1 ke saath 255.255.255.240 (/28) diya gaya. /28 ke saath host bits aakhri 4 hain: 1 = <code>0000|0001</code>, to network 10.20.30.0 aur broadcast <code>0000|1111</code> = 10.20.30.15 hai. R1 samajhta hai uska LAN .15 par khatam hota hai, isliye .50 wala PC2 R1 ke wire par nahi hai. Sahi /26 ke saath broadcast <code>00|111111</code> = .63 hai aur .50 fit hota hai.</p></div>

<h3>Router kya dikhata hai</h3>
<p>Jab aap interface configure karte ho, router network address khud calculate kar leta hai. <code>show ip route connected</code> <b>C</b> (connected network) aur <b>L</b> (local /32 host) routes dikhata hai:</p>
<pre class="out">R1# show ip route connected
      10.0.0.0/8 is variably subnetted, 4 subnets, 3 masks
C        10.0.0.0/30 is directly connected, GigabitEthernet0/0
L        10.0.0.1/32 is directly connected, GigabitEthernet0/0
<span class="hl">C        10.20.30.0/28 is directly connected, GigabitEthernet0/1</span>
L        10.20.30.1/32 is directly connected, GigabitEthernet0/1</pre>
<p>Highlighted /28 hi troubleshooting lab ka fault hai: connected route asli office subnet se chhota hai.</p>

<h3>Practice drills (answers neeche)</h3>
<p>Network, first, last aur broadcast nikalo: <b>a)</b> 192.168.1.100/27 <b>b)</b> 10.0.0.19/29 <b>c)</b> 172.20.130.5/17 <b>d)</b> 192.0.2.66/30.</p>
<div class="tip"><p><b>Answers.</b> a) 100 = 011|00100 → net 192.168.1.96, first .97, last .126, bcast .127. b) 19 = 00010|011 → net 10.0.0.16, first .17, last .22, bcast .23. c) third octet 130 = 1|0000010 → net 172.20.128.0, first 172.20.128.1, last 172.20.255.254, bcast 172.20.255.255. d) 66 = 010000|10 → net 192.0.2.64, usable .65 aur .66, bcast .67.</p></div>

<div class="warn"><p><b>Common galti.</b> Sirf interesting octet par kaam karna aur uske baad ke octets bhool jaana. 10.1.8.0/22 ka broadcast 10.1.11.<b>255</b> hai, 10.1.11.0 nahi. 172.20.128.0/17 ka first usable 172.20.128.1 hai, 172.20.129.0 nahi.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Inme se kaunsa valid host address hai?" Har option ke liye network aur broadcast nikalo; jo options inme se kisi ke barabar hain woh traps hain. 10.1.8.0/22 mein 10.1.10.0 valid hai aur 10.1.11.255 nahi.</p></div>

<div class="scn"><h4>Raat 2 baje "Bad mask"</h4><p>Raat ke change mein ek engineer ne R2 ke naye LAN interface ko 192.168.50.64 address mask 255.255.255.192 ke saath dene ki koshish ki, design sheet se subnet ka naam copy karke. IOS ne mana kar diya: <code>Bad mask /26 for address 192.168.50.64</code>. Usne socha router kharab hai aur 20 minute gawa diye. Message ka matlab hai ki address us /26 ka network address hai (saare host bits 0), isliye yeh interface par nahi baith sakta. Design ka matlab tha pehla usable, 192.168.50.65.</p><p><b>Seekh:</b> design sheet mein subnet names network addresses hote hain. Interfaces ko usable addresses milte hain.</p></div>

<div class="iv"><p class="q">"172.16.45.77/27 ka network, broadcast aur usable range batao, aur dikhao kaise nikala."</p><p>Strong answer: mask 255.255.255.224 hai, interesting octet fourth hai; 77 = 01001101, 11100000 se AND karne par 01000000 = 64, to network 172.16.45.64; host bits sab 1 karne par 01011111 = 95, broadcast; usable .65 se .94, 30 hosts. Phir tez check batao: /27 32 ka block hai, 77 64 aur 96 ke beech aata hai, same answer.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Network = host bits sab 0; broadcast = host bits sab 1; dono host ko assign nahi ho sakte.</li>
<li>First usable = network + 1; last usable = broadcast − 1.</li>
<li>Binary sirf interesting octet par karo; pehle ke octets copy, baad ke 0 ya 255.</li>
<li>Routers result ko C (connected network) aur L (local /32) routes ki tarah dikhate hain.</li>
<li>"Bad mask /n for address" ka matlab aapne network (ya broadcast) address assign karne ki koshish ki.</li>
</ul></div>
`}};export{e as default};