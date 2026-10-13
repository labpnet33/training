var e={id:`block-size`,h:{en:`The block-size method: subnet any address in your head`,hi:`Block-size method: kisi bhi address ko dimaag mein subnet karo`},body:{en:`
<p>Binary shows you <i>why</i> subnetting works; the block-size method (also called the "magic number") is how engineers actually do it, in their heads, on a call, in seconds. It gives the same answers as chapter 5 without writing a single bit.</p>

<h3>An analogy: numbered parking bays</h3>
<p>A car park paints its bays in blocks of equal size, say 64 bays per colour. Blocks always start at 0, 64, 128, 192. If your ticket says bay 100, you do not need to count: 100 is past 64 and before 128, so you are in the block that starts at 64 and ends at 127. The block size of a subnet works exactly the same way, and subnets always start on a multiple of their block size.</p>

<h3>The four steps</h3>
<ol>
<li><b>Find the interesting octet</b>: the octet where the mask is not 255 and not 0.</li>
<li><b>Block size</b> = 256 − the mask value in that octet.</li>
<li><b>Network</b>: in the interesting octet, take the largest multiple of the block size that is less than or equal to the address's value. Octets to the right become 0.</li>
<li><b>Broadcast</b>: next multiple − 1 in the interesting octet; octets to the right become 255. First usable = network + 1, last usable = broadcast − 1.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="192.168.50.0/24 split into four /26 blocks">
<rect x="20" y="40" width="148" height="44" fill="#bae6fd"/><text x="94" y="60" text-anchor="middle" class="svg-ink" font-size="13">Sales</text><text x="94" y="77" text-anchor="middle" class="svg-muted" font-size="12">.0 – .63</text>
<rect x="168" y="40" width="148" height="44" fill="#bbf7d0"/><text x="242" y="60" text-anchor="middle" class="svg-ink" font-size="13">HR</text><text x="242" y="77" text-anchor="middle" class="svg-muted" font-size="12">.64 – .127</text>
<rect x="316" y="40" width="148" height="44" fill="#ddd6fe"/><text x="390" y="60" text-anchor="middle" class="svg-ink" font-size="13">IT</text><text x="390" y="77" text-anchor="middle" class="svg-muted" font-size="12">.128 – .191</text>
<rect x="464" y="40" width="148" height="44" fill="#e2e8f0"/><text x="538" y="60" text-anchor="middle" class="svg-ink" font-size="13">Growth</text><text x="538" y="77" text-anchor="middle" class="svg-muted" font-size="12">.192 – .255</text>
<text x="20" y="30" class="svg-muted" font-size="12">0</text><text x="160" y="30" class="svg-muted" font-size="12">64</text><text x="304" y="30" class="svg-muted" font-size="12">128</text><text x="452" y="30" class="svg-muted" font-size="12">192</text><text x="596" y="30" class="svg-muted" font-size="12">256</text>
<text x="320" y="120" text-anchor="middle" class="svg-accent" font-size="13">/26 → mask 192 → block size 256 − 192 = 64</text>
<text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">each block starts on a multiple of 64</text>
</svg><p class="cap">The branch office plan from the configuration lab, read straight off the block size.</p></div>

<h3>The lab plan, derived</h3>
<p>The branch has 192.168.50.0/24 and needs /26 subnets. Mask 255.255.255.192, interesting octet the fourth, block size 64. Subnets start at .0, .64, .128 and .192.</p>
<table class="cmp"><tr><th>Subnet</th><th>Network</th><th>First usable (R1)</th><th>Last usable (PC)</th><th>Broadcast</th></tr>
<tr><td>Sales (Gi0/0)</td><td>192.168.50.0</td><td>.1</td><td>.62 PC-SALES</td><td>.63</td></tr>
<tr><td>HR (Gi0/1)</td><td>192.168.50.64</td><td>.65</td><td>.126 PC-HR</td><td>.127</td></tr>
<tr><td>IT (Gi0/2)</td><td>192.168.50.128</td><td>.129</td><td>.190 PC-IT</td><td>.191</td></tr>
<tr><td>Growth</td><td>192.168.50.192</td><td>.193</td><td>.254</td><td>.255</td></tr>
</table>
<p>The last question in the configuration lab asks for the broadcast of the growth subnet: the block after .192 would start at 256, so the broadcast is 256 − 1 = <b>192.168.50.255</b>.</p>

<div class="eg"><p><b>Worked example: 192.168.10.77/28.</b> Mask 240, block 16. Multiples: 0, 16, 32, 48, 64, 80. 77 sits between 64 and 80. Network <b>192.168.10.64</b>, broadcast 80 − 1 = <b>.79</b>, usable .65 – .78, 14 hosts.</p>
<p><b>Worked example: 172.16.45.200/20.</b> Mask 255.255.240.0, interesting octet the third, block 16. Multiples: 32, 48. 45 is in the 32 block. Network <b>172.16.32.0</b>, broadcast <b>172.16.47.255</b>, usable 172.16.32.1 – 172.16.47.254. Same answer as the binary method in chapter 5, with no binary.</p>
<p><b>Worked example: 10.20.130.7/12.</b> Mask 255.240.0.0, interesting octet the second, block 16. 20 is in the 16 block (16 – 31). Network <b>10.16.0.0</b>, broadcast <b>10.31.255.255</b>.</p></div>

<h3>Drills (cover the right-hand columns)</h3>
<table class="cmp"><tr><th>Address</th><th>Network</th><th>Broadcast</th><th>Usable range</th></tr>
<tr><td>192.168.10.77/27</td><td>192.168.10.64</td><td>192.168.10.95</td><td>.65 – .94</td></tr>
<tr><td>198.51.100.200/29</td><td>198.51.100.200</td><td>198.51.100.207</td><td>.201 – .206</td></tr>
<tr><td>10.1.1.9/30</td><td>10.1.1.8</td><td>10.1.1.11</td><td>.9 – .10</td></tr>
<tr><td>172.20.5.130/25</td><td>172.20.5.128</td><td>172.20.5.255</td><td>.129 – .254</td></tr>
<tr><td>192.168.50.190/26</td><td>192.168.50.128</td><td>192.168.50.191</td><td>.129 – .190</td></tr>
<tr><td>172.16.203.10/22</td><td>172.16.200.0</td><td>172.16.203.255</td><td>172.16.200.1 – 172.16.203.254</td></tr>
<tr><td>10.40.13.77/21</td><td>10.40.8.0</td><td>10.40.15.255</td><td>10.40.8.1 – 10.40.15.254</td></tr>
</table>

<div class="warn"><p><b>Common mistakes.</b> Applying the block size to the wrong octet: for /20 the block of 16 lives in the third octet, not the fourth. And forgetting that octets to the right of the interesting octet become 0 for the network and 255 for the broadcast.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Are 10.1.1.30/27 and 10.1.1.34/27 in the same subnet?" Block 32: .30 is in .0 – .31, .34 is in .32 – .63. Different subnets, so they need a router, even though the numbers look close. Always compute; never eyeball.</p></div>

<div class="scn"><h4>The firewall rule that blocked half the guests</h4><p>Guest Wi-Fi handed out addresses from 10.40.8.0/21. A new firewall rule allowing guests to the internet was written for 10.40.8.0/22. Some guests browsed fine; others got nothing. The engineer did the block-size check aloud: /22 has block 4 in the third octet, so it covers 10.40.8.x to 10.40.11.x only. Guests leased 10.40.12.x to 10.40.15.x were outside the rule. Changing the object to /21 (block 8, 8 to 15) fixed every guest.</p><p><b>Lesson:</b> a prefix in a rule, route or scope must match the real subnet. Check it with the block size, not by eye.</p></div>

<div class="iv"><p class="q">"Without a calculator, what are the network and broadcast of 172.16.45.200/20?"</p><p>Strong answer, spoken aloud: "/20 is 255.255.240.0, so the third octet is interesting and the block size is 16. Multiples of 16 around 45 are 32 and 48, so the network is 172.16.32.0 and the broadcast is 172.16.47.255. Usable is .32.1 to .47.254, 4094 hosts." Interviewers care about the method as much as the answer, so narrate the steps.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Block size = 256 − the mask value in the interesting octet.</li>
<li>Subnets start on multiples of the block size; the network is the multiple at or below the address.</li>
<li>Broadcast = next multiple − 1, with any octets to the right set to 255.</li>
<li>The lab /24 split into /26s gives .0, .64, .128, .192; R1 uses .1/.65/.129, the PCs .62/.126/.190.</li>
<li>For prefixes shorter than /24 the same method runs in the third or second octet.</li>
</ul></div>
`,hi:`
<p>Binary aapko dikhata hai ki subnetting <i>kyun</i> kaam karta hai; block-size method (jise "magic number" bhi kehte hain) woh hai jisse engineers asal mein ise karte hain, dimaag mein, call par, seconds mein. Yeh ek bhi bit likhe bina chapter 5 jaise hi answers deta hai.</p>

<h3>Ek analogy: numbered parking bays</h3>
<p>Ek car park apne bays ko barabar size ke blocks mein paint karta hai, maano har rang ke 64 bays. Blocks hamesha 0, 64, 128, 192 se shuru hote hain. Agar aapke ticket par bay 100 likha hai, to ginne ki zaroorat nahi: 100, 64 ke baad aur 128 se pehle hai, to aap us block mein ho jo 64 se shuru hota hai aur 127 par khatam. Subnet ka block size bilkul aise hi kaam karta hai, aur subnets hamesha apne block size ke multiple par shuru hote hain.</p>

<h3>Chaar steps</h3>
<ol>
<li><b>Interesting octet dhoondo</b>: woh octet jahan mask na 255 hai na 0.</li>
<li><b>Block size</b> = 256 − us octet ki mask value.</li>
<li><b>Network</b>: interesting octet mein block size ka woh sabse bada multiple lo jo address ki value se chhota ya barabar ho. Uske right ke octets 0 ban jaate hain.</li>
<li><b>Broadcast</b>: interesting octet mein agla multiple − 1; right ke octets 255 ban jaate hain. Pehla usable = network + 1, aakhri usable = broadcast − 1.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="192.168.50.0/24 chaar /26 blocks mein bata hua">
<rect x="20" y="40" width="148" height="44" fill="#bae6fd"/><text x="94" y="60" text-anchor="middle" class="svg-ink" font-size="13">Sales</text><text x="94" y="77" text-anchor="middle" class="svg-muted" font-size="12">.0 – .63</text>
<rect x="168" y="40" width="148" height="44" fill="#bbf7d0"/><text x="242" y="60" text-anchor="middle" class="svg-ink" font-size="13">HR</text><text x="242" y="77" text-anchor="middle" class="svg-muted" font-size="12">.64 – .127</text>
<rect x="316" y="40" width="148" height="44" fill="#ddd6fe"/><text x="390" y="60" text-anchor="middle" class="svg-ink" font-size="13">IT</text><text x="390" y="77" text-anchor="middle" class="svg-muted" font-size="12">.128 – .191</text>
<rect x="464" y="40" width="148" height="44" fill="#e2e8f0"/><text x="538" y="60" text-anchor="middle" class="svg-ink" font-size="13">Growth</text><text x="538" y="77" text-anchor="middle" class="svg-muted" font-size="12">.192 – .255</text>
<text x="20" y="30" class="svg-muted" font-size="12">0</text><text x="160" y="30" class="svg-muted" font-size="12">64</text><text x="304" y="30" class="svg-muted" font-size="12">128</text><text x="452" y="30" class="svg-muted" font-size="12">192</text><text x="596" y="30" class="svg-muted" font-size="12">256</text>
<text x="320" y="120" text-anchor="middle" class="svg-accent" font-size="13">/26 → mask 192 → block size 256 − 192 = 64</text>
<text x="320" y="146" text-anchor="middle" class="svg-muted" font-size="12">har block 64 ke multiple par shuru hota hai</text>
</svg><p class="cap">Configuration lab ka branch office plan, seedha block size se padha hua.</p></div>

<h3>Lab plan, nikaala hua</h3>
<p>Branch ke paas 192.168.50.0/24 hai aur use /26 subnets chahiye. Mask 255.255.255.192, interesting octet chautha, block size 64. Subnets .0, .64, .128 aur .192 se shuru hote hain.</p>
<table class="cmp"><tr><th>Subnet</th><th>Network</th><th>Pehla usable (R1)</th><th>Aakhri usable (PC)</th><th>Broadcast</th></tr>
<tr><td>Sales (Gi0/0)</td><td>192.168.50.0</td><td>.1</td><td>.62 PC-SALES</td><td>.63</td></tr>
<tr><td>HR (Gi0/1)</td><td>192.168.50.64</td><td>.65</td><td>.126 PC-HR</td><td>.127</td></tr>
<tr><td>IT (Gi0/2)</td><td>192.168.50.128</td><td>.129</td><td>.190 PC-IT</td><td>.191</td></tr>
<tr><td>Growth</td><td>192.168.50.192</td><td>.193</td><td>.254</td><td>.255</td></tr>
</table>
<p>Configuration lab ka aakhri sawaal growth subnet ka broadcast poochta hai: .192 ke baad ka block 256 par shuru hota, isliye broadcast 256 − 1 = <b>192.168.50.255</b> hai.</p>

<div class="eg"><p><b>Worked example: 192.168.10.77/28.</b> Mask 240, block 16. Multiples: 0, 16, 32, 48, 64, 80. 77, 64 aur 80 ke beech hai. Network <b>192.168.10.64</b>, broadcast 80 − 1 = <b>.79</b>, usable .65 – .78, 14 hosts.</p>
<p><b>Worked example: 172.16.45.200/20.</b> Mask 255.255.240.0, interesting octet teesra, block 16. Multiples: 32, 48. 45, 32 wale block mein hai. Network <b>172.16.32.0</b>, broadcast <b>172.16.47.255</b>, usable 172.16.32.1 – 172.16.47.254. Chapter 5 ke binary method jaisa hi answer, bina binary ke.</p>
<p><b>Worked example: 10.20.130.7/12.</b> Mask 255.240.0.0, interesting octet doosra, block 16. 20, 16 wale block (16 – 31) mein hai. Network <b>10.16.0.0</b>, broadcast <b>10.31.255.255</b>.</p></div>

<h3>Drills (right wale columns dhak lo)</h3>
<table class="cmp"><tr><th>Address</th><th>Network</th><th>Broadcast</th><th>Usable range</th></tr>
<tr><td>192.168.10.77/27</td><td>192.168.10.64</td><td>192.168.10.95</td><td>.65 – .94</td></tr>
<tr><td>198.51.100.200/29</td><td>198.51.100.200</td><td>198.51.100.207</td><td>.201 – .206</td></tr>
<tr><td>10.1.1.9/30</td><td>10.1.1.8</td><td>10.1.1.11</td><td>.9 – .10</td></tr>
<tr><td>172.20.5.130/25</td><td>172.20.5.128</td><td>172.20.5.255</td><td>.129 – .254</td></tr>
<tr><td>192.168.50.190/26</td><td>192.168.50.128</td><td>192.168.50.191</td><td>.129 – .190</td></tr>
<tr><td>172.16.203.10/22</td><td>172.16.200.0</td><td>172.16.203.255</td><td>172.16.200.1 – 172.16.203.254</td></tr>
<tr><td>10.40.13.77/21</td><td>10.40.8.0</td><td>10.40.15.255</td><td>10.40.8.1 – 10.40.15.254</td></tr>
</table>

<div class="warn"><p><b>Common galtiyan.</b> Block size ko galat octet par lagana: /20 ke liye 16 ka block teesre octet mein hai, chauthe mein nahi. Aur bhool jaana ki interesting octet ke right ke octets network ke liye 0 aur broadcast ke liye 255 ban jaate hain.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Kya 10.1.1.30/27 aur 10.1.1.34/27 same subnet mein hain?" Block 32: .30, .0 – .31 mein hai, .34, .32 – .63 mein. Alag subnets, isliye router chahiye, bhale hi numbers paas-paas dikhein. Hamesha calculate karo; andaaze se mat bolo.</p></div>

<div class="scn"><h4>Firewall rule jisne aadhe guests block kar diye</h4><p>Guest Wi-Fi 10.40.8.0/21 se addresses deta tha. Guests ko internet allow karne wala naya firewall rule 10.40.8.0/22 ke liye likha gaya. Kuch guests aaram se browse kar rahe the; baakiyon ko kuch nahi mil raha tha. Engineer ne zor se block-size check kiya: /22 ka teesre octet mein block 4 hai, to yeh sirf 10.40.8.x se 10.40.11.x cover karta hai. Jin guests ko 10.40.12.x se 10.40.15.x lease mila tha woh rule ke bahar the. Object ko /21 (block 8, 8 se 15) karne se har guest theek ho gaya.</p><p><b>Seekh:</b> rule, route ya scope mein prefix asli subnet se match hona chahiye. Use aankh se nahi, block size se check karo.</p></div>

<div class="iv"><p class="q">"Bina calculator ke, 172.16.45.200/20 ka network aur broadcast kya hai?"</p><p>Strong answer, bol kar: "/20 matlab 255.255.240.0, to teesra octet interesting hai aur block size 16 hai. 45 ke aas-paas 16 ke multiples 32 aur 48 hain, to network 172.16.32.0 aur broadcast 172.16.47.255 hai. Usable .32.1 se .47.254, 4094 hosts." Interviewers ko method utna hi chahiye jitna answer, isliye steps bol kar batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Block size = 256 − interesting octet ki mask value.</li>
<li>Subnets block size ke multiples par shuru hote hain; network woh multiple hai jo address ke barabar ya neeche ho.</li>
<li>Broadcast = agla multiple − 1, right ke saare octets 255.</li>
<li>Lab ka /24 /26s mein baantne se .0, .64, .128, .192 milte hain; R1 .1/.65/.129 use karta hai, PCs .62/.126/.190.</li>
<li>/24 se chhote prefixes ke liye yahi method teesre ya doosre octet mein chalta hai.</li>
</ul></div>
`}};export{e as default};