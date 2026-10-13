var e={id:`troubleshooting-slow-client`,h:{en:`Troubleshooting workflow: why is my client slow? (Labs 3 and 4)`,hi:`Troubleshooting workflow: mera client slow kyun hai? (Labs 3 aur 4)`},body:{en:`
<p>"The Wi-Fi is slow" is the most common wireless ticket, and also the least useful description. A good engineer turns it into evidence in a fixed order. The order matters because each step removes a whole class of causes before you touch any configuration. This chapter gives the method and then walks the two troubleshoot labs.</p>

<h3>Analogy: a doctor, not a guesser</h3>
<p>A doctor does not prescribe medicine on "I feel unwell". She checks temperature, pulse, history. You check client, band, width, rates, signal and channel, in that order, and write down what each shows.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Slow client flow">
<rect x="20" y="15" width="600" height="32" rx="6" fill="#bae6fd"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">1. Which client? standard, streams, max width, bands (capabilities)</text>
<rect x="20" y="55" width="600" height="32" rx="6" fill="#bbf7d0"/><text x="320" y="76" text-anchor="middle" class="svg-ink" font-size="13">2. Which band is it on? (wifi link / Clients page) - does the WLAN serve 5 GHz?</text>
<rect x="20" y="95" width="600" height="32" rx="6" fill="#fde68a"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="13">3. Which width and MCS? (RF profile, AP summary) - narrower than the client can do?</text>
<rect x="20" y="135" width="600" height="32" rx="6" fill="#fed7aa"/><text x="320" y="156" text-anchor="middle" class="svg-ink" font-size="13">4. Which rates and protection? (802.11b rates on? flags in link output)</text>
<rect x="20" y="175" width="600" height="32" rx="6" fill="#ddd6fe"/><text x="320" y="196" text-anchor="middle" class="svg-ink" font-size="13">5. Signal and SNR, then channel overlap and utilisation</text>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">Change one thing, re-run the link, compare. Write down before and after.</text>
</svg><p class="cap">Five questions, always in this order. Most slow-client tickets end by step 4.</p></div>

<table class="cmp"><tr><th>Evidence</th><th>Likely cause</th><th>Command or page</th></tr>
<tr><td>Client on 2.4 GHz though dual band</td><td>WLAN radio policy 2.4 only, 5 GHz signal too weak, band preference</td><td><code>show wlan name</code>; Monitoring &gt; Wireless &gt; Clients</td></tr>
<tr><td>Width 20 MHz, client can do 80</td><td>RF profile width pinned to 20</td><td><code>show ap rf-profile name ... detail</code></td></tr>
<tr><td>Protection flag, 2.4 GHz slow</td><td>802.11b rates enabled</td><td><code>wifi link</code> (bss flags)</td></tr>
<tr><td>Low MCS, good RSSI</td><td>Noise, interference, co-channel neighbours</td><td>AP summary, channel plan, wl-rf</td></tr>
<tr><td>Association rejected</td><td>Status 17 or 18, key mismatch</td><td>Controller log, chapter 8 codes</td></tr></table>

<h3>Lab 3: slow Wi-Fi 6 laptop (band and width)</h3>
<p>The ticket: LAPTOP1 is Wi-Fi 6, two streams, up to 80 MHz, but the estimate is only about 140 Mbps right next to AP1. Step 1, collect evidence from both sides.</p>
<pre class="out">WLC1# show wlan name NK-STAFF

WLAN Profile Name     : NK-STAFF
Status                         : Enabled
<span class="hl">Configured Radio Bands         : 2.4 GHz only</span>

LAPTOP1&gt; wifi link
Connected to 0011.2233.4400 (on wlan0)
        SSID: NK-STAFF
        freq: 2437
        signal: -52 dBm
<span class="hl">        rx bitrate: 206.5 MBit/s HE-MCS 8 HE-NSS 2</span>
<span class="hl">        protocol: Wi-Fi 6, 2.4 GHz, 20 MHz, 2 spatial streams</span>
        estimated throughput: about 134 Mbps (teaching estimate: PHY rate x MAC efficiency)</pre>
<p>Sample values. Reading it: the laptop is on 2.4 GHz at 20 MHz with a good signal. Two causes are hidden. First, somebody limited NK-STAFF to 2.4 GHz (cause one). Fix it: the WLAN must be disabled first, and adding 5 GHz restores both bands.</p>
<pre class="code">wlan NK-STAFF
 shutdown
 radio policy dot11 5ghz
 no shutdown</pre>
<p>Second, the 5 GHz RF profile PRO-5 is pinned to 20 MHz. Widen it to 80 MHz (shut the profile before the change, then enable it; this is the same discipline as Lab 2):</p>
<pre class="code">ap dot11 5ghz rf-profile PRO-5
 shutdown
 channel chan-width 80
 no shutdown</pre>
<p>GUI: <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs &gt; NK-STAFF</b> (disable, <b>General &gt; Radio Policy</b>, both bands, enable) and <b>Configuration &gt; Tags &amp; Profiles &gt; RF &gt; PRO-5 &gt; RRM &gt; DCA &gt; Channel Width</b> (in the simulator: <b>Configuration &gt; Wireless &gt; RRM</b>). Then reconnect the client with <code>wifi connect NK-STAFF psk NkStaff2024</code> and re-run <code>wifi link</code>.</p>
<pre class="out">LAPTOP1&gt; wifi link
        signal: -57 dBm
<span class="hl">        rx bitrate: 960.8 MBit/s 80MHz HE-MCS 9 HE-NSS 2 HE-GI 0 HE-DCM 0</span>
<span class="hl">        protocol: Wi-Fi 6, 5 GHz, 80 MHz, 2 spatial streams</span>
        estimated throughput: about 624 Mbps (teaching estimate: PHY rate x MAC efficiency)</pre>
<p>The proof needed: 5 GHz, 80 MHz and an estimate of at least 300 Mbps. Notice that fixing only the band (still 20 MHz) would give only about 150 to 190 Mbps, and fixing only the width would change nothing, because the laptop would still be on 2.4 GHz (where width stays 20 MHz). Two faults, two fixes, one verification.</p>

<h3>Lab 4: slow 2.4 GHz band (legacy rates and a 40 MHz channel)</h3>
<p>The ticket: 2.4 GHz-only Wi-Fi 4 laptops are slow although signal is good. Read the profile and the radio table.</p>
<pre class="out">WLC1# show ap rf-profile name CAMPUS-24 detail

RF Profile Name                  : CAMPUS-24
Band                             : 2.4 GHz
Status                           : Up
<span class="hl">Channel width                    : 40 MHz</span>
Lowest mandatory data rate       : 1 Mbps
Data rates                       : 1, 2, 5.5, 11, 6, 9, 12, 18, 24, 36, 48, 54

LAPTOP1&gt; wifi link
        protocol: Wi-Fi 4, 2.4 GHz, 40 MHz, 2 spatial streams
<span class="hl">        bss flags: short-preamble, protection (802.11b rates enabled)</span></pre>
<p>Two faults: a 40 MHz channel in a band with only three clean channels (so neighbouring APs overlap), and 802.11b rates that force protection. Fix:</p>
<pre class="code">ap dot11 24ghz rf-profile CAMPUS-24
 shutdown
 channel chan-width 20
 rate RATE_1M disable
 rate RATE_2M disable
 rate RATE_5_5M disable
 rate RATE_11M disable
 no shutdown</pre>
<p>GUI: <b>Configuration &gt; Tags &amp; Profiles &gt; RF &gt; CAMPUS-24</b> (width on RRM &gt; DCA, rates on 802.11 &gt; Data Rates). Then reconnect the client and prove three things: no protection flag in <code>wifi link</code>, 20 MHz, and no 2.4 GHz overlap in <code>show ap dot11 24ghz summary</code> (the lowest mandatory rate becomes 12 Mbps). Disabling the b rates also lets the AP stop advertising protection to its OFDM clients.</p>

<div class="warn"><p><b>Common mistake.</b> Fixing the symptom you see first and stopping. In both labs there are two faults. After each change, re-run the evidence command; if the number is still wrong, there is another cause.</p></div>
<div class="exam"><p><b>Exam trap.</b> On 2.4 GHz the model (and good design) keeps 20 MHz, so widening to "fix speed" there makes things worse. A wider width helps only in 5 GHz, and only when the client supports it and the channel plan has room.</p></div>

<div class="scn"><h4>The ticket that said "Wi-Fi slow on floor 3"</h4><p>Ten helpdesk tickets in two days. The engineer picked one laptop and ran the five questions. Client: Wi-Fi 5, 2 streams. Band: 2.4 GHz. WLAN: radio policy on both bands, but the laptop's signal on 5 GHz was -78 dBm because the AP's 5 GHz power had been cut to level 5. Fix: raise the 5 GHz transmit power, so the laptop moved to 5 GHz at -64 dBm, and the ticket count dropped to zero.</p><p><b>Lesson:</b> work client-first, with numbers. The cause was power on one band, not "bad Wi-Fi".</p></div>

<div class="iv"><p class="q">"A user says Wi-Fi is slow. What do you check first?"</p><p>Strong answer: identify the client and its capabilities, then which band, width, MCS and signal it uses (link output or client detail on the controller), then rates and protection, then channel utilisation and neighbours. Only then change config, one thing at a time, and re-verify with the same command. Mention comparing against a good client at the same spot.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: client, band, width and MCS, rates and protection, signal and channel.</li>
<li>Lab 3: NK-STAFF back to both bands, PRO-5 to 80 MHz, then prove 5 GHz, 80 MHz and at least 300 Mbps.</li>
<li>Lab 4: CAMPUS-24 to 20 MHz, disable 1, 2, 5.5 and 11 Mbps, then prove no protection flag and no overlap.</li>
<li>Change one thing at a time and re-run the same evidence command.</li>
<li>Expect more than one fault in a ticket.</li>
</ul></div>
`,hi:`
<p>"Wi-Fi slow hai" sabse common wireless ticket hai, aur sabse kam kaam ka description bhi. Achha engineer ise ek fixed order mein evidence mein badalta hai. Order isliye matter karta hai kyunki har step configuration chhune se pehle kai causes ki puri class hata deta hai. Yeh chapter method deta hai aur phir do troubleshoot labs walk karta hai.</p>

<h3>Analogy: doctor, andaze wala nahi</h3>
<p>Doctor "mujhe achha nahi lag raha" par dawai nahi deti. Woh temperature, pulse, history check karti hai. Aap client, band, width, rates, signal aur channel isi order mein check karte ho, aur har ek jo dikhata hai woh likhte ho.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Slow client flow">
<rect x="20" y="15" width="600" height="32" rx="6" fill="#bae6fd"/><text x="320" y="36" text-anchor="middle" class="svg-ink" font-size="13">1. Kaunsa client? standard, streams, max width, bands (capabilities)</text>
<rect x="20" y="55" width="600" height="32" rx="6" fill="#bbf7d0"/><text x="320" y="76" text-anchor="middle" class="svg-ink" font-size="13">2. Kaunse band par hai? (wifi link / Clients page) - kya WLAN 5 GHz serve karta hai?</text>
<rect x="20" y="95" width="600" height="32" rx="6" fill="#fde68a"/><text x="320" y="116" text-anchor="middle" class="svg-ink" font-size="13">3. Kaunsi width aur MCS? (RF profile, AP summary) - client ki kshamta se kam?</text>
<rect x="20" y="135" width="600" height="32" rx="6" fill="#fed7aa"/><text x="320" y="156" text-anchor="middle" class="svg-ink" font-size="13">4. Kaunse rates aur protection? (802.11b rates on? link output ke flags)</text>
<rect x="20" y="175" width="600" height="32" rx="6" fill="#ddd6fe"/><text x="320" y="196" text-anchor="middle" class="svg-ink" font-size="13">5. Signal aur SNR, phir channel overlap aur utilisation</text>
<text x="320" y="235" text-anchor="middle" class="svg-muted" font-size="12">Ek cheez badlo, link dobara chalao, compare karo. Pehle aur baad likho.</text>
</svg><p class="cap">Paanch sawal, hamesha isi order mein. Zyada tar slow-client tickets step 4 tak khatam ho jaate hain.</p></div>

<table class="cmp"><tr><th>Evidence</th><th>Likely cause</th><th>Command ya page</th></tr>
<tr><td>Dual band hone par bhi client 2.4 GHz par</td><td>WLAN radio policy sirf 2.4, 5 GHz signal bahut kamzor, band preference</td><td><code>show wlan name</code>; Monitoring &gt; Wireless &gt; Clients</td></tr>
<tr><td>Width 20 MHz, client 80 kar sakta hai</td><td>RF profile width 20 par pinned</td><td><code>show ap rf-profile name ... detail</code></td></tr>
<tr><td>Protection flag, 2.4 GHz slow</td><td>802.11b rates enabled</td><td><code>wifi link</code> (bss flags)</td></tr>
<tr><td>Low MCS, achha RSSI</td><td>Noise, interference, co-channel padosi</td><td>AP summary, channel plan, wl-rf</td></tr>
<tr><td>Association rejected</td><td>Status 17 ya 18, key mismatch</td><td>Controller log, chapter 8 codes</td></tr></table>

<h3>Lab 3: slow Wi-Fi 6 laptop (band aur width)</h3>
<p>Ticket: LAPTOP1 Wi-Fi 6 hai, do streams, 80 MHz tak, lekin AP1 ke bagal mein bhi estimate sirf lagbhag 140 Mbps hai. Step 1, dono taraf se evidence collect karo.</p>
<pre class="out">WLC1# show wlan name NK-STAFF

WLAN Profile Name     : NK-STAFF
Status                         : Enabled
<span class="hl">Configured Radio Bands         : 2.4 GHz only</span>

LAPTOP1&gt; wifi link
Connected to 0011.2233.4400 (on wlan0)
        SSID: NK-STAFF
        freq: 2437
        signal: -52 dBm
<span class="hl">        rx bitrate: 206.5 MBit/s HE-MCS 8 HE-NSS 2</span>
<span class="hl">        protocol: Wi-Fi 6, 2.4 GHz, 20 MHz, 2 spatial streams</span>
        estimated throughput: about 134 Mbps (teaching estimate: PHY rate x MAC efficiency)</pre>
<p>Sample values. Padhna: laptop 2.4 GHz par 20 MHz mein hai aur signal achha hai. Do causes chhupe hain. Pehla, kisi ne NK-STAFF ko 2.4 GHz tak limit kar diya (cause one). Fix: WLAN pehle disabled hona chahiye, aur 5 GHz jodne se dono bands wapas aa jaate hain.</p>
<pre class="code">wlan NK-STAFF
 shutdown
 radio policy dot11 5ghz
 no shutdown</pre>
<p>Dusra, 5 GHz RF profile PRO-5 20 MHz par pinned hai. Use 80 MHz karo (change se pehle profile shut karo, phir enable; Lab 2 wala hi discipline):</p>
<pre class="code">ap dot11 5ghz rf-profile PRO-5
 shutdown
 channel chan-width 80
 no shutdown</pre>
<p>GUI: <b>Configuration &gt; Tags &amp; Profiles &gt; WLANs &gt; NK-STAFF</b> (disable, <b>General &gt; Radio Policy</b>, dono bands, enable) aur <b>Configuration &gt; Tags &amp; Profiles &gt; RF &gt; PRO-5 &gt; RRM &gt; DCA &gt; Channel Width</b> (simulator mein: <b>Configuration &gt; Wireless &gt; RRM</b>). Phir client ko <code>wifi connect NK-STAFF psk NkStaff2024</code> se reconnect karo aur <code>wifi link</code> dobara chalao.</p>
<pre class="out">LAPTOP1&gt; wifi link
        signal: -57 dBm
<span class="hl">        rx bitrate: 960.8 MBit/s 80MHz HE-MCS 9 HE-NSS 2 HE-GI 0 HE-DCM 0</span>
<span class="hl">        protocol: Wi-Fi 6, 5 GHz, 80 MHz, 2 spatial streams</span>
        estimated throughput: about 624 Mbps (teaching estimate: PHY rate x MAC efficiency)</pre>
<p>Chahiye proof: 5 GHz, 80 MHz aur kam se kam 300 Mbps ka estimate. Dhyan do: sirf band fix karne se (abhi bhi 20 MHz) sirf lagbhag 150 se 190 Mbps milta, aur sirf width fix karne se kuch nahi badalta, kyunki laptop abhi bhi 2.4 GHz par rehta (jahan width 20 MHz hi rehti hai). Do faults, do fixes, ek verification.</p>

<h3>Lab 4: slow 2.4 GHz band (legacy rates aur 40 MHz channel)</h3>
<p>Ticket: sirf 2.4 GHz wale Wi-Fi 4 laptops signal achha hone par bhi slow hain. Profile aur radio table padho.</p>
<pre class="out">WLC1# show ap rf-profile name CAMPUS-24 detail

RF Profile Name                  : CAMPUS-24
Band                             : 2.4 GHz
Status                           : Up
<span class="hl">Channel width                    : 40 MHz</span>
Lowest mandatory data rate       : 1 Mbps
Data rates                       : 1, 2, 5.5, 11, 6, 9, 12, 18, 24, 36, 48, 54

LAPTOP1&gt; wifi link
        protocol: Wi-Fi 4, 2.4 GHz, 40 MHz, 2 spatial streams
<span class="hl">        bss flags: short-preamble, protection (802.11b rates enabled)</span></pre>
<p>Do faults: aise band mein 40 MHz channel jahan sirf teen saaf channels hain (isliye padosi APs overlap karte hain), aur 802.11b rates jo protection force karte hain. Fix:</p>
<pre class="code">ap dot11 24ghz rf-profile CAMPUS-24
 shutdown
 channel chan-width 20
 rate RATE_1M disable
 rate RATE_2M disable
 rate RATE_5_5M disable
 rate RATE_11M disable
 no shutdown</pre>
<p>GUI: <b>Configuration &gt; Tags &amp; Profiles &gt; RF &gt; CAMPUS-24</b> (width RRM &gt; DCA par, rates 802.11 &gt; Data Rates par). Phir client reconnect karo aur teen cheezein prove karo: <code>wifi link</code> mein protection flag nahi, 20 MHz, aur <code>show ap dot11 24ghz summary</code> mein 2.4 GHz overlap nahi (lowest mandatory rate 12 Mbps ho jaata hai). b rates disable karne se AP apne OFDM clients ko protection advertise karna bhi band kar deta hai.</p>

<div class="warn"><p><b>Common galti.</b> Jo symptom pehle dikha use fix karke ruk jaana. Dono labs mein do faults hain. Har change ke baad evidence command dobara chalao; number abhi bhi galat hai to ek aur cause hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> 2.4 GHz par model (aur achha design) 20 MHz rakhta hai, isliye wahan "speed fix" ke liye widen karna halat bigaadta hai. Wider width sirf 5 GHz mein madad karti hai, aur tabhi jab client support kare aur channel plan mein jagah ho.</p></div>

<div class="scn"><h4>"Floor 3 par Wi-Fi slow" wala ticket</h4><p>Do din mein das helpdesk tickets. Engineer ne ek laptop chuna aur paanch sawal chalaye. Client: Wi-Fi 5, 2 streams. Band: 2.4 GHz. WLAN: radio policy dono bands par, lekin laptop ka 5 GHz signal -78 dBm tha kyunki AP ki 5 GHz power level 5 par kaat di gayi thi. Fix: 5 GHz transmit power badhayi, laptop -64 dBm par 5 GHz par chala gaya, aur ticket count zero ho gaya.</p><p><b>Seekh:</b> client-first kaam karo, numbers ke saath. Cause ek band ki power thi, "kharab Wi-Fi" nahi.</p></div>

<div class="iv"><p class="q">"User kehta hai Wi-Fi slow hai. Pehle kya check karoge?"</p><p>Strong answer: client aur uski capabilities pehchano, phir kaunsa band, width, MCS aur signal use ho raha hai (link output ya controller par client detail), phir rates aur protection, phir channel utilisation aur padosi. Tabhi config badlo, ek cheez ek baar mein, aur wahi command se dobara verify karo. Batao ki same jagah par ek achhe client se compare karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: client, band, width aur MCS, rates aur protection, signal aur channel.</li>
<li>Lab 3: NK-STAFF wapas dono bands par, PRO-5 80 MHz, phir 5 GHz, 80 MHz aur kam se kam 300 Mbps prove karo.</li>
<li>Lab 4: CAMPUS-24 20 MHz, 1, 2, 5.5 aur 11 Mbps disable, phir no protection flag aur no overlap prove karo.</li>
<li>Ek baar mein ek cheez badlo aur wahi evidence command dobara chalao.</li>
<li>Ticket mein ek se zyada fault ki ummeed rakho.</li>
</ul></div>
`}};export{e as default};