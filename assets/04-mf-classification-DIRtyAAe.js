var e={id:`mf-classification`,h:{en:`Multifield classification with firewall filters`,hi:`Firewall filters se multifield classification`},body:{en:`
<p>A BA classifier is only as good as the marking it trusts. What if the source cannot mark? A laptop running a softphone, a guest tablet, or an old PBX sends everything as DSCP 0. For these cases Junos offers <b>multifield (MF) classification</b>: a firewall filter that looks at several header fields at once (source and destination address, protocol, ports) and sets the forwarding class and loss priority itself.</p>

<h3>BA versus MF in one table</h3>
<table class="cmp"><tr><th></th><th>BA classifier</th><th>MF classifier (filter)</th></tr>
<tr><td>Looks at</td><td>One field: DSCP, precedence or 802.1p</td><td>Addresses, protocol, ports, flags, and more</td></tr>
<tr><td>Trust</td><td>Trusts the sender's marking</td><td>Does not trust; decides by flow</td></tr>
<tr><td>Where configured</td><td>class-of-service classifiers</td><td>firewall family inet filter</td></tr>
<tr><td>Scale</td><td>Light, per interface</td><td>Heavier, per term</td></tr>
<tr><td>Priority</td><td>Runs first</td><td>Runs after BA and overrides it</td></tr></table>
<p>Because the filter runs after the BA classifier, its decision is final: a packet that the BA table put into best-effort can be moved to expedited-forwarding by a matching filter term.</p>

<h3>The voice lab filter</h3>
<p>In the Nashik branch, softphones live in the voice subnet 10.50.10.0/24 and send RTP over UDP ports 16384 to 32767 without marking. On BR1 you build filter <code>VOICE-IN</code> and apply it as an <b>input</b> filter on the LAN interface:</p>
<pre class="code"><span class="c"># config on BR1</span>
set firewall family inet filter VOICE-IN term rtp from source-address 10.50.10.0/24
set firewall family inet filter VOICE-IN term rtp from protocol udp
set firewall family inet filter VOICE-IN term rtp from destination-port 16384-32767
set firewall family inet filter VOICE-IN term rtp then forwarding-class expedited-forwarding
set firewall family inet filter VOICE-IN term rtp then loss-priority low
set firewall family inet filter VOICE-IN term rtp then accept
<span class="hl">set firewall family inet filter VOICE-IN term rest then accept</span>
set interfaces ge-0/0/1 unit 0 family inet filter input VOICE-IN
commit</pre>
<pre class="out">lab@BR1&gt; show configuration firewall
family inet {
    filter VOICE-IN {
        term rtp {
            from {
                source-address 10.50.10.0/24;
                destination-port 16384-32767;
                protocol udp;
            }
            then {
                accept;
                forwarding-class expedited-forwarding;
                loss-priority low;
            }
        }
        term rest {
            then {
                accept;
            }
        }
    }
}</pre>
<p>Read it like a program. A packet is tested against terms from the top. All <code>from</code> conditions inside one term must match (logical AND). The first matching term decides, and its <code>then</code> actions run. A term with no <code>from</code> matches everything, which is why <code>rest</code> works as the catch-all.</p>

<h3>The classic mistake: no final accept</h3>
<p>Every Junos filter ends with an <b>implicit discard</b>. If you forget the catch-all term, every packet that does not match <code>rtp</code> is dropped. We deliberately built the lab without the <code>rest</code> term. The result on the SOFTPH host was:</p>
<pre class="out">SOFTPH&gt; ping 10.60.1.10
10.60.1.10 icmp_seq=1 timeout
10.60.1.10 icmp_seq=2 timeout
10.60.1.10 icmp_seq=3 timeout
<span class="hl">...</span>
LAPTOP&gt; ping 10.60.1.10
84 bytes from 10.60.1.10 icmp_seq=1 ttl=62 time=0.500 ms</pre>
<p>The ping from SOFTPH (ICMP, not UDP RTP) was discarded by the implicit discard, while the RTP stream (UDP 20000) passed. The laptop on the unfiltered data subnet was fine. A phone that "works" while the PC next to it has no network is a typical symptom of a missing accept term.</p>

<h3>Proving the classification</h3>
<p>With the filter in place, a test call lands in queue 1 of the egress interface:</p>
<pre class="out">lab@BR1&gt; show interfaces queue ge-0/0/0
Queue: 0, Forwarding classes: best-effort
  Queued:
    Packets              :                     5                     1 pps
Queue: 1, Forwarding classes: expedited-forwarding
  Queued:
    <span class="hl">Packets              :                   400                    32 pps</span>
  Transmitted:
    Packets              :                   400                    32 pps
    Tail-dropped packets :                     0                     0 pps</pre>
<p>(The output is trimmed to the packet lines. The flow was 128 kbps UDP for 5 seconds, 80 packets per second, so 400 packets fit.) Counting inside a term with <code>then count name</code> gives you per-filter packet and byte counters you can read with <code>show firewall filter NAME</code>.</p>

<div class="eg"><p><b>Worked example.</b> A UDP packet from 10.50.10.20 to 10.60.1.10, destination port 20000, enters BR1 on ge-0/0/1. The BA classifier on that unit (the default) labels it best-effort. The filter then evaluates term <code>rtp</code>: source is inside 10.50.10.0/24, protocol is UDP, port 20000 is in 16384-32767, all true. It sets FC=EF and PLP=low and accepts. The packet leaves through queue 1. A TCP packet to port 443 from the same host fails the <code>from</code> protocol test, falls to <code>rest</code>, is accepted and stays best-effort.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) No catch-all accept term. (2) Applying the filter in the wrong direction; the classification filter in this chapter belongs on <code>input</code> of the ingress unit. (3) Putting the specific term after a wide one, so the wide term matches first. (4) Using a large port range as a security measure; MF here is for QoS, not for security.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which classification is applied if both a BA classifier and an MF filter match?" The filter wins, because it runs after the BA classifier. Also remember that a term with only non-terminating actions such as <code>then forwarding-class</code> lets evaluation continue to the next term, so add <code>accept</code> to stop there.</p></div>

<div class="scn"><h4>Softphones on the guest VLAN</h4><p>After a laptop refresh, a call centre moved to softphones. Agents complained of choppy audio when the nightly file sync ran. The softphone client could not set DSCP. Rather than touching 200 laptops, the network team created a filter matching the call server's address and the RTP port range, set EF with low loss priority, and applied it as an input filter on the access layer uplink. Calls were clean the next night.</p><p><b>Lesson:</b> MF classification solves the "untrusted or unmarkable source" problem at the network edge, once, centrally.</p></div>

<div class="iv"><p class="q">"When would you use a multifield classifier instead of a BA classifier?"</p><p>When the traffic is not marked or the marking cannot be trusted: softphones, guest devices, legacy systems. I match on addresses, protocol and ports in an input filter, set the forwarding class and loss priority, and always finish with an accept term. I note that MF runs after BA and overrides it, and that BA is cheaper, so I use BA inside the trusted core and MF at the edge.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MF classification is a firewall filter with <code>then forwarding-class</code> and <code>then loss-priority</code>.</li>
<li>It runs after the BA classifier and overrides it.</li>
<li>All <code>from</code> conditions in a term are ANDed; the first matching term wins.</li>
<li>Every filter ends with an implicit discard; add a catch-all accept term.</li>
<li>Apply classification filters as <code>input</code> on the ingress unit.</li>
</ul></div>
`,hi:`
<p>BA classifier utna hi acha hai jitna us marking par bharosa kiya jaa sake. Agar source mark hi na kar paaye to? Softphone chalane wala laptop, guest tablet, ya purana PBX sab kuch DSCP 0 ke saath bhejta hai. In cases ke liye Junos <b>multifield (MF) classification</b> deta hai: ek firewall filter jo ek saath kai header fields (source aur destination address, protocol, ports) dekhta hai aur forwarding class aur loss priority khud set karta hai.</p>

<h3>BA aur MF ek table mein</h3>
<table class="cmp"><tr><th></th><th>BA classifier</th><th>MF classifier (filter)</th></tr>
<tr><td>Kya dekhta hai</td><td>Ek field: DSCP, precedence ya 802.1p</td><td>Addresses, protocol, ports, flags, aur bahut kuch</td></tr>
<tr><td>Trust</td><td>Sender ki marking par bharosa</td><td>Bharosa nahi; flow se faisla</td></tr>
<tr><td>Kahan configure hota hai</td><td>class-of-service classifiers</td><td>firewall family inet filter</td></tr>
<tr><td>Scale</td><td>Halka, per interface</td><td>Bhaari, per term</td></tr>
<tr><td>Priority</td><td>Pehle chalta hai</td><td>BA ke baad chalta hai aur use override karta hai</td></tr></table>
<p>Kyunki filter BA classifier ke baad chalta hai, uska faisla aakhri hota hai: BA table ne jo packet best-effort mein daala, matching filter term use expedited-forwarding mein shift kar sakta hai.</p>

<h3>Voice lab ka filter</h3>
<p>Nashik branch mein softphones voice subnet 10.50.10.0/24 mein hain aur UDP ports 16384 se 32767 par bina marking ke RTP bhejte hain. BR1 par aap filter <code>VOICE-IN</code> banate ho aur use LAN interface par <b>input</b> filter ki tarah lagate ho:</p>
<pre class="code"><span class="c"># config BR1 par</span>
set firewall family inet filter VOICE-IN term rtp from source-address 10.50.10.0/24
set firewall family inet filter VOICE-IN term rtp from protocol udp
set firewall family inet filter VOICE-IN term rtp from destination-port 16384-32767
set firewall family inet filter VOICE-IN term rtp then forwarding-class expedited-forwarding
set firewall family inet filter VOICE-IN term rtp then loss-priority low
set firewall family inet filter VOICE-IN term rtp then accept
<span class="hl">set firewall family inet filter VOICE-IN term rest then accept</span>
set interfaces ge-0/0/1 unit 0 family inet filter input VOICE-IN
commit</pre>
<pre class="out">lab@BR1&gt; show configuration firewall
family inet {
    filter VOICE-IN {
        term rtp {
            from {
                source-address 10.50.10.0/24;
                destination-port 16384-32767;
                protocol udp;
            }
            then {
                accept;
                forwarding-class expedited-forwarding;
                loss-priority low;
            }
        }
        term rest {
            then {
                accept;
            }
        }
    }
}</pre>
<p>Ise program ki tarah padho. Packet ko upar se terms ke against test kiya jaata hai. Ek term ke andar saari <code>from</code> conditions match honi chahiye (logical AND). Pehla matching term faisla karta hai aur uske <code>then</code> actions chalte hain. Jis term mein <code>from</code> nahi hota woh sab se match hota hai, isliye <code>rest</code> catch-all ki tarah kaam karta hai.</p>

<h3>Classic galti: aakhir mein accept nahi</h3>
<p>Har Junos filter ke end mein <b>implicit discard</b> hota hai. Catch-all term bhool gaye to jo bhi packet <code>rtp</code> se match nahi karta woh drop ho jaata hai. Humne lab jaan-bujhkar <code>rest</code> term ke bina banaya. SOFTPH host par nateeja yeh tha:</p>
<pre class="out">SOFTPH&gt; ping 10.60.1.10
10.60.1.10 icmp_seq=1 timeout
10.60.1.10 icmp_seq=2 timeout
10.60.1.10 icmp_seq=3 timeout
<span class="hl">...</span>
LAPTOP&gt; ping 10.60.1.10
84 bytes from 10.60.1.10 icmp_seq=1 ttl=62 time=0.500 ms</pre>
<p>SOFTPH ka ping (ICMP, UDP RTP nahi) implicit discard ne gira diya, jabki RTP stream (UDP 20000) nikal gaya. Bina filter wale data subnet ka laptop theek tha. Phone "chal raha hai" aur uske bagal ke PC ka network nahi, yeh missing accept term ka typical symptom hai.</p>

<h3>Classification ko prove karna</h3>
<p>Filter lagne ke baad test call egress interface ki queue 1 mein jaati hai:</p>
<pre class="out">lab@BR1&gt; show interfaces queue ge-0/0/0
Queue: 0, Forwarding classes: best-effort
  Queued:
    Packets              :                     5                     1 pps
Queue: 1, Forwarding classes: expedited-forwarding
  Queued:
    <span class="hl">Packets              :                   400                    32 pps</span>
  Transmitted:
    Packets              :                   400                    32 pps
    Tail-dropped packets :                     0                     0 pps</pre>
<p>(Output ko packet lines tak trim kiya gaya hai. Flow 5 second ke liye 128 kbps UDP thi, 80 packets per second, yaani 400 packets.) Term ke andar <code>then count name</code> lagane se per-filter packet aur byte counters milte hain jo <code>show firewall filter NAME</code> se padhe jaate hain.</p>

<div class="eg"><p><b>Worked example.</b> 10.50.10.20 se 10.60.1.10 ko destination port 20000 wala UDP packet BR1 ke ge-0/0/1 par aata hai. Us unit ka BA classifier (default) use best-effort label karta hai. Phir filter term <code>rtp</code> evaluate karta hai: source 10.50.10.0/24 ke andar hai, protocol UDP hai, port 20000 range 16384-32767 mein hai, sab sach. Woh FC=EF aur PLP=low set karke accept karta hai. Packet queue 1 se nikalta hai. Usi host ka port 443 par TCP packet <code>from</code> ka protocol test fail karta hai, <code>rest</code> par girta hai, accept hota hai aur best-effort rehta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Catch-all accept term nahi. (2) Filter ko galat direction mein lagana; is chapter ka classification filter ingress unit ke <code>input</code> par lagta hai. (3) Specific term ko wide term ke baad rakhna, taaki wide term pehle match ho. (4) Bade port range ko security measure samajhna; yahan MF QoS ke liye hai, security ke liye nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> "BA classifier aur MF filter dono match karein to kaunsi classification lagti hai?" Filter jeetta hai, kyunki woh BA ke baad chalta hai. Yeh bhi yaad rakho ki sirf <code>then forwarding-class</code> jaise non-terminating actions wala term evaluation ko agle term tak jaane deta hai, isliye wahin rokne ke liye <code>accept</code> jodo.</p></div>

<div class="scn"><h4>Guest VLAN par softphones</h4><p>Laptop refresh ke baad ek call centre softphones par shift hua. Nightly file sync chalte hi agents ne choppy audio ki shikayat ki. Softphone client DSCP set nahi kar sakta tha. 200 laptops chhune ki jagah network team ne call server ke address aur RTP port range par match karne wala filter banaya, low loss priority ke saath EF set kiya, aur access layer uplink par input filter lagaya. Agli raat calls saaf thi.</p><p><b>Lesson:</b> MF classification "untrusted ya unmarkable source" ki samasya network edge par ek baar, centrally, hal karta hai.</p></div>

<div class="iv"><p class="q">"BA classifier ki jagah multifield classifier kab use karoge?"</p><p>Jab traffic marked na ho ya marking par bharosa na kiya jaa sake: softphones, guest devices, legacy systems. Main input filter mein addresses, protocol aur ports par match karta hoon, forwarding class aur loss priority set karta hoon, aur end mein hamesha accept term rakhta hoon. Yeh bhi kehta hoon ki MF, BA ke baad chalta hai aur use override karta hai, aur BA sasta hai, isliye trusted core mein BA aur edge par MF.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>MF classification <code>then forwarding-class</code> aur <code>then loss-priority</code> wala firewall filter hai.</li>
<li>Yeh BA classifier ke baad chalta hai aur use override karta hai.</li>
<li>Term ki saari <code>from</code> conditions AND hoti hain; pehla matching term jeet-ta hai.</li>
<li>Har filter ke end mein implicit discard hai; catch-all accept term jodo.</li>
<li>Classification filters ko ingress unit par <code>input</code> ki tarah lagao.</li>
</ul></div>
`}};export{e as default};