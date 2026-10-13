var e={id:`nat-acls-wildcards`,h:{en:`NAT and ACLs: wildcard masks review and choosing who gets translated`,hi:`NAT aur ACLs: wildcard masks review aur kaun translate ho yeh chunna`},body:{en:`
<p>A wedding caterer is told "serve everyone whose name is on this guest list". The list is not a security guard at the gate; it just decides who gets a plate. Guests not on the list are not thrown out, they simply do not get served by this caterer. In a NAT rule, the ACL is that guest list. It decides which inside local addresses <b>get translated</b>. It does not permit or deny traffic through the router. Because every dynamic NAT and PAT rule depends on it, a single wrong wildcard bit can make NAT silently ignore a whole LAN. This chapter reviews just enough ACL and wildcard knowledge for NAT; the ccna-acl module covers filtering in depth.</p>

<h3>Wildcard masks in one page</h3>
<p>A wildcard mask is 32 bits, written like an address, that tells the router which bits of the address must match:</p>
<ul>
<li>A <b>0</b> bit means "this bit must match exactly".</li>
<li>A <b>1</b> bit means "ignore this bit, anything goes".</li>
</ul>
<p>For a normal subnet, the wildcard is the <b>inverse of the subnet mask</b>: subtract each mask octet from 255.</p>
<table class="cmp"><tr><th>Prefix</th><th>Subnet mask</th><th>Wildcard</th><th>Example line</th></tr>
<tr><td>/32</td><td>255.255.255.255</td><td>0.0.0.0</td><td>permit host 172.16.10.80</td></tr>
<tr><td>/24</td><td>255.255.255.0</td><td>0.0.0.255</td><td>permit 10.20.0.0 0.0.0.255</td></tr>
<tr><td>/22</td><td>255.255.252.0</td><td>0.0.3.255</td><td>permit 192.168.0.0 0.0.3.255</td></tr>
<tr><td>/16</td><td>255.255.0.0</td><td>0.0.255.255</td><td>permit 172.16.0.0 0.0.255.255</td></tr>
<tr><td>/0</td><td>0.0.0.0</td><td>255.255.255.255</td><td>permit any</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Wildcard 0.0.3.255 on the third octet">
<text x="20" y="35" class="svg-ink" font-size="13">3rd octet of 192.168.0.0:</text>
<text x="260" y="35" class="svg-ink" font-size="14">0 0 0 0 0 0 | 0 0</text>
<text x="20" y="70" class="svg-ink" font-size="13">Wildcard 3rd octet (3):</text>
<text x="260" y="70" class="svg-ink" font-size="14">0 0 0 0 0 0 | 1 1</text>
<rect x="255" y="85" width="118" height="30" rx="6" fill="#bbf7d0"/><text x="314" y="105" text-anchor="middle" class="svg-ink" font-size="12">must match</text>
<rect x="385" y="85" width="50" height="30" rx="6" fill="#fde68a"/><text x="410" y="105" text-anchor="middle" class="svg-ink" font-size="12">any</text>
<text x="20" y="150" class="svg-accent" font-size="13">Matches 3rd octet 0, 1, 2, 3 → 192.168.0.x to 192.168.3.x</text>
<text x="20" y="180" class="svg-muted" font-size="12">192.168.1.10 and 192.168.2.10 match; 192.168.4.1 does not.</text>
</svg><p class="cap">The PAT lab's ACL: the last two bits of the third octet are "don't care", so four /24s match in one line.</p></div>

<h3>Summarising several LANs in one line</h3>
<p>In the PAT lab, BR must translate 192.168.1.0/24 and 192.168.2.0/24. You could write two lines, but the task asks for as few lines as possible. <code>access-list 1 permit 192.168.0.0 0.0.3.255</code> matches 192.168.0.0 to 192.168.3.255, which contains both LANs. The trick works only when the block is <b>aligned</b>: a block of four /24s must start at a third octet divisible by 4 (0, 4, 8, …). <code>192.168.2.0 0.0.3.255</code> is not a sensible entry; IOS silently rewrites it to 192.168.0.0 in the running config, which can hide a design mistake.</p>
<p>Matching a slightly larger range than you need (192.168.0.0 and 192.168.3.0 are not in use) is harmless for NAT selection, because no host there sends traffic. For filtering ACLs you would be stricter.</p>

<h3>How NAT uses the ACL</h3>
<ul>
<li><b>permit</b> = translate this source. <b>deny</b> or the implicit deny = do not translate; the packet is still routed, untranslated.</li>
<li>A <b>standard</b> ACL (numbers 1–99, 1300–1999, or a named standard ACL) matches only the source address. That is all NAT usually needs.</li>
<li>Named ACLs work too: <code>ip nat inside source list NAT-USERS interface GigabitEthernet0/1 overload</code>.</li>
<li>An <b>extended</b> ACL can match source and destination, which is how engineers do <b>NAT exemption</b>: do not translate traffic going into a site-to-site VPN, but translate everything going to the internet.</li>
</ul>
<pre class="code"><span class="c">! NAT exemption: branch LAN to HQ over VPN stays untranslated</span>
BR(config)# ip access-list extended NAT-LIST
BR(config-ext-nacl)#  deny   ip 192.168.1.0 0.0.0.255 10.50.0.0 0.0.255.255
BR(config-ext-nacl)#  permit ip 192.168.1.0 0.0.0.255 any
BR(config-ext-nacl)# exit
BR(config)# ip nat inside source list NAT-LIST interface GigabitEthernet0/1 overload</pre>

<div class="eg"><p><b>Worked example: does it match?</b> ACL <code>access-list 5 permit 10.20.0.0 0.0.1.255</code>. The wildcard's third octet is 1, so the last bit of the third octet is "don't care": it matches 10.20.0.x and 10.20.1.x. Test hosts: 10.20.0.13 matches; 10.20.1.200 matches; 10.20.2.1 does not (third octet 2 = binary 10, the second-to-last bit differs); 10.21.0.1 does not (second octet must be 20).</p></div>

<h3>Checking it</h3>
<pre class="out">BR# show access-lists 1
Standard IP access list 1
<span class="hl">    10 permit 192.168.0.0, wildcard bits 0.0.3.255</span>
BR# show running-config | include ip nat
 ip nat inside
 ip nat inside
 ip nat outside
<span class="hl">ip nat inside source list 1 interface GigabitEthernet0/1 overload</span></pre>
<p>Confirm that the ACL number or name in the NAT rule is <b>exactly</b> the ACL you built. A rule pointing to list 10 when you created list 1 references an empty ACL, which matches nothing.</p>

<div class="warn"><p><b>Common mistake.</b> Using <code>access-list 1 permit any</code> to "make it work". It will translate everything that crosses inside to outside, including traffic that should stay untranslated, such as VPN or partner traffic. Match only the inside subnets you mean.</p></div>

<div class="exam"><p><b>Exam trap.</b> Wildcards are <b>not</b> subnet masks. <code>access-list 1 permit 10.20.0.0 255.255.255.0</code> matches addresses whose first three octets are anything and whose last octet is 0: the opposite of what the writer meant. Expect a question that hides exactly this.</p></div>

<div class="scn"><h4>The new VLAN that never got out</h4><p>A college added VLAN 30, 192.168.4.0/24, for a new lab. Existing VLANs 1 to 3 browsed fine, the new lab could reach internal servers but not the internet. The NAT ACL was <code>permit 192.168.0.0 0.0.3.255</code>, written when there were only four /24s. 192.168.4.x fell outside it, so it was routed out untranslated and the ISP dropped it. The engineer added <code>access-list 1 permit 192.168.4.0 0.0.0.255</code>.</p><p><b>Lesson:</b> when you add a subnet, update the NAT ACL; summarised wildcards have hard edges.</p></div>

<div class="iv"><p class="q">"In a NAT configuration, what does the ACL do, and what happens to traffic that it denies?"</p><p>Strong answer: the ACL selects which inside local sources are eligible for translation; it is not a security filter. Denied traffic, including the implicit deny, is simply not translated and is routed as it is. Show a wildcard example such as 0.0.3.255 covering four /24s, mention named and extended ACLs, and give NAT exemption for VPN traffic as a real use of deny lines.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>In NAT, ACL permit = translate; deny or implicit deny = forward untranslated.</li>
<li>Wildcard 0 bits must match, 1 bits are ignored; wildcard = 255 minus each mask octet.</li>
<li>192.168.0.0 0.0.3.255 covers 192.168.0.0–192.168.3.255; blocks must be aligned.</li>
<li>Extended ACLs allow NAT exemption (deny VPN traffic, permit internet traffic).</li>
<li>Check that the rule references the exact ACL you built, and update it when you add subnets.</li>
</ul></div>
`,hi:`
<p>Shaadi ke caterer ko kaha jaata hai "is guest list mein jinka naam hai unhe serve karo". List gate par security guard nahi hai; woh bas decide karti hai ki plate kise milegi. Jo guests list mein nahi hain unhe bahar nahi nikala jaata, bas yeh caterer unhe serve nahi karta. NAT rule mein ACL wahi guest list hai. Yeh decide karta hai ki kaunse inside local addresses <b>translate honge</b>. Yeh router se traffic permit ya deny nahi karta. Kyunki har dynamic NAT aur PAT rule is par depend karta hai, ek galat wildcard bit NAT ko chupchaap poora LAN ignore karwa sakta hai. Yeh chapter NAT ke liye utna hi ACL aur wildcard knowledge review karta hai jitna chahiye; filtering ko ccna-acl module gehraai se cover karta hai.</p>

<h3>Ek page mein wildcard masks</h3>
<p>Wildcard mask 32 bits ka hota hai, address jaisa likha jaata hai, jo router ko batata hai ki address ke kaunse bits match hone chahiye:</p>
<ul>
<li><b>0</b> bit matlab "yeh bit exactly match hona chahiye".</li>
<li><b>1</b> bit matlab "is bit ko ignore karo, kuch bhi chalega".</li>
</ul>
<p>Normal subnet ke liye wildcard <b>subnet mask ka ulta</b> hai: har mask octet ko 255 se ghatao.</p>
<table class="cmp"><tr><th>Prefix</th><th>Subnet mask</th><th>Wildcard</th><th>Example line</th></tr>
<tr><td>/32</td><td>255.255.255.255</td><td>0.0.0.0</td><td>permit host 172.16.10.80</td></tr>
<tr><td>/24</td><td>255.255.255.0</td><td>0.0.0.255</td><td>permit 10.20.0.0 0.0.0.255</td></tr>
<tr><td>/22</td><td>255.255.252.0</td><td>0.0.3.255</td><td>permit 192.168.0.0 0.0.3.255</td></tr>
<tr><td>/16</td><td>255.255.0.0</td><td>0.0.255.255</td><td>permit 172.16.0.0 0.0.255.255</td></tr>
<tr><td>/0</td><td>0.0.0.0</td><td>255.255.255.255</td><td>permit any</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 210" role="img" aria-label="Teesre octet par wildcard 0.0.3.255">
<text x="20" y="35" class="svg-ink" font-size="13">192.168.0.0 ka 3rd octet:</text>
<text x="260" y="35" class="svg-ink" font-size="14">0 0 0 0 0 0 | 0 0</text>
<text x="20" y="70" class="svg-ink" font-size="13">Wildcard 3rd octet (3):</text>
<text x="260" y="70" class="svg-ink" font-size="14">0 0 0 0 0 0 | 1 1</text>
<rect x="255" y="85" width="118" height="30" rx="6" fill="#bbf7d0"/><text x="314" y="105" text-anchor="middle" class="svg-ink" font-size="12">match zaroori</text>
<rect x="385" y="85" width="50" height="30" rx="6" fill="#fde68a"/><text x="410" y="105" text-anchor="middle" class="svg-ink" font-size="12">kuch bhi</text>
<text x="20" y="150" class="svg-accent" font-size="13">3rd octet 0, 1, 2, 3 match → 192.168.0.x se 192.168.3.x</text>
<text x="20" y="180" class="svg-muted" font-size="12">192.168.1.10 aur 192.168.2.10 match; 192.168.4.1 nahi.</text>
</svg><p class="cap">PAT lab ka ACL: teesre octet ke aakhri do bits "don't care" hain, isliye ek line mein chaar /24 match hote hain.</p></div>

<h3>Kai LANs ek line mein summarise karna</h3>
<p>PAT lab mein BR ko 192.168.1.0/24 aur 192.168.2.0/24 translate karne hain. Aap do lines likh sakte ho, par task kam se kam lines maangta hai. <code>access-list 1 permit 192.168.0.0 0.0.3.255</code> 192.168.0.0 se 192.168.3.255 match karta hai, jismein dono LANs aa jaate hain. Yeh trick tabhi chalti hai jab block <b>aligned</b> ho: chaar /24 ka block aise teesre octet se shuru hona chahiye jo 4 se divide ho (0, 4, 8, …). <code>192.168.2.0 0.0.3.255</code> sensible entry nahi hai; IOS chupchaap running config mein ise 192.168.0.0 bana deta hai, jo design ki galti chhupa sakta hai.</p>
<p>Zaroorat se thodi badi range match karna (192.168.0.0 aur 192.168.3.0 use mein nahi) NAT selection ke liye nuksaan-deh nahi, kyunki wahan koi host traffic nahi bhejta. Filtering ACLs mein aap zyada strict rehte.</p>

<h3>NAT ACL ko kaise use karta hai</h3>
<ul>
<li><b>permit</b> = is source ko translate karo. <b>deny</b> ya implicit deny = translate mat karo; packet phir bhi route hota hai, bina translation.</li>
<li><b>Standard</b> ACL (numbers 1–99, 1300–1999, ya named standard ACL) sirf source address match karta hai. NAT ko aam taur par itna hi chahiye.</li>
<li>Named ACLs bhi chalte hain: <code>ip nat inside source list NAT-USERS interface GigabitEthernet0/1 overload</code>.</li>
<li><b>Extended</b> ACL source aur destination dono match kar sakta hai, aur isi se engineers <b>NAT exemption</b> karte hain: site-to-site VPN mein jaane wala traffic translate mat karo, par internet jaane wala sab translate karo.</li>
</ul>
<pre class="code"><span class="c">! NAT exemption: branch LAN se HQ VPN par bina translation</span>
BR(config)# ip access-list extended NAT-LIST
BR(config-ext-nacl)#  deny   ip 192.168.1.0 0.0.0.255 10.50.0.0 0.0.255.255
BR(config-ext-nacl)#  permit ip 192.168.1.0 0.0.0.255 any
BR(config-ext-nacl)# exit
BR(config)# ip nat inside source list NAT-LIST interface GigabitEthernet0/1 overload</pre>

<div class="eg"><p><b>Worked example: match karta hai ya nahi?</b> ACL <code>access-list 5 permit 10.20.0.0 0.0.1.255</code>. Wildcard ka teesra octet 1 hai, isliye teesre octet ka aakhri bit "don't care" hai: yeh 10.20.0.x aur 10.20.1.x match karta hai. Test hosts: 10.20.0.13 match; 10.20.1.200 match; 10.20.2.1 nahi (teesra octet 2 = binary 10, aakhri se pehla bit alag hai); 10.21.0.1 nahi (doosra octet 20 hona chahiye).</p></div>

<h3>Check karna</h3>
<pre class="out">BR# show access-lists 1
Standard IP access list 1
<span class="hl">    10 permit 192.168.0.0, wildcard bits 0.0.3.255</span>
BR# show running-config | include ip nat
 ip nat inside
 ip nat inside
 ip nat outside
<span class="hl">ip nat inside source list 1 interface GigabitEthernet0/1 overload</span></pre>
<p>Confirm karo ki NAT rule mein ACL number ya naam <b>exactly</b> wahi ACL hai jo aapne banaya. Agar rule list 10 ko point kare jabki aapne list 1 banayi, to woh khali ACL ko refer karta hai, jo kuch match nahi karta.</p>

<div class="warn"><p><b>Common galti.</b> "Chalane ke liye" <code>access-list 1 permit any</code> use karna. Yeh inside se outside cross karne wala sab kuch translate kar dega, woh traffic bhi jo bina translation rehna chahiye, jaise VPN ya partner traffic. Sirf woh inside subnets match karo jo aapka matlab hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> Wildcards subnet masks <b>nahi</b> hain. <code>access-list 1 permit 10.20.0.0 255.255.255.0</code> un addresses ko match karta hai jinke pehle teen octets kuch bhi hon aur aakhri octet 0 ho: likhne wale ke matlab ka bilkul ulta. Aisa question expect karo jo exactly yahi chhupata hai.</p></div>

<div class="scn"><h4>Naya VLAN jo kabhi bahar nahi nikla</h4><p>Ek college ne naye lab ke liye VLAN 30, 192.168.4.0/24, joda. Purane VLANs 1 se 3 theek browse karte the, naya lab internal servers tak pahunch jaata par internet tak nahi. NAT ACL tha <code>permit 192.168.0.0 0.0.3.255</code>, jo tab likha gaya jab sirf chaar /24 the. 192.168.4.x uske bahar tha, isliye woh bina translation route hua aur ISP ne drop kar diya. Engineer ne <code>access-list 1 permit 192.168.4.0 0.0.0.255</code> joda.</p><p><b>Seekh:</b> jab subnet jodo, NAT ACL update karo; summarised wildcards ki kinaar sakht hoti hai.</p></div>

<div class="iv"><p class="q">"NAT configuration mein ACL kya karta hai, aur jo traffic woh deny karta hai uska kya hota hai?"</p><p>Strong answer: ACL select karta hai ki kaunse inside local sources translation ke liye eligible hain; yeh security filter nahi hai. Denied traffic, implicit deny samet, bas translate nahi hota aur jaisa hai waisa route hota hai. 0.0.3.255 jaisa wildcard example dikhao jo chaar /24 cover karta hai, named aur extended ACLs ka zikr karo, aur deny lines ke asli use ki tarah VPN traffic ke liye NAT exemption do.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAT mein ACL permit = translate; deny ya implicit deny = bina translation forward.</li>
<li>Wildcard ke 0 bits match hone chahiye, 1 bits ignore; wildcard = har mask octet 255 se ghata kar.</li>
<li>192.168.0.0 0.0.3.255 192.168.0.0–192.168.3.255 cover karta hai; blocks aligned hone chahiye.</li>
<li>Extended ACLs NAT exemption dete hain (VPN traffic deny, internet traffic permit).</li>
<li>Check karo ki rule exactly aapka banaya ACL refer karta hai, aur subnets jodne par use update karo.</li>
</ul></div>
`}};export{e as default};