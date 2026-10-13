var e={id:`fbf-lab`,h:{en:`Filter-based forwarding lab: the training lab goes out through ISP-B`,hi:`Filter-based forwarding lab: training lab ISP-B se bahar jaata hai`},body:{en:`
<p>Now build it step by step and prove it works. Router R1 has two ISP links: ge-0/0/0 (10.0.1.1/30) to ISPA and ge-0/0/1 (10.0.2.1/30) to ISPB. Staff PC1 sits on ge-0/0/2 (10.1.1.0/24) and the lab PC2 on ge-0/0/3 (10.1.2.0/24). R1 has a static default route to ISPA. The test target is a server on 198.51.100.10 beyond a router NET that is reachable from both ISPs.</p>

<div class="dia"><svg viewBox="0 0 680 250" role="img" aria-label="ISP lab topology">
<rect x="20" y="40" width="70" height="40" rx="8" fill="#e2e8f0"/><text x="55" y="65" text-anchor="middle" class="svg-ink" font-size="12">PC1</text>
<rect x="20" y="170" width="70" height="40" rx="8" fill="#e2e8f0"/><text x="55" y="195" text-anchor="middle" class="svg-ink" font-size="12">PC2</text>
<rect x="150" y="90" width="110" height="80" rx="10" fill="#bae6fd"/><text x="205" y="125" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="205" y="147" text-anchor="middle" class="svg-muted" font-size="11">FBF here</text>
<rect x="340" y="30" width="80" height="45" rx="8" fill="#fde68a"/><text x="380" y="58" text-anchor="middle" class="svg-ink" font-size="13">ISPA</text>
<rect x="340" y="185" width="80" height="45" rx="8" fill="#bbf7d0"/><text x="380" y="213" text-anchor="middle" class="svg-ink" font-size="13">ISPB</text>
<rect x="500" y="105" width="80" height="50" rx="8" fill="#e2e8f0"/><text x="540" y="135" text-anchor="middle" class="svg-ink" font-size="13">NET</text>
<rect x="610" y="110" width="60" height="40" rx="8" fill="#e2e8f0"/><text x="640" y="135" text-anchor="middle" class="svg-ink" font-size="11">SRV</text>
<line x1="90" y1="60" x2="150" y2="105" stroke="#64748b" stroke-width="2"/><line x1="90" y1="190" x2="150" y2="155" stroke="#64748b" stroke-width="2"/>
<line x1="260" y1="105" x2="340" y2="55" stroke="#d97706" stroke-width="2"/><line x1="260" y1="155" x2="340" y2="205" stroke="#16a34a" stroke-width="3"/>
<line x1="420" y1="55" x2="500" y2="120" stroke="#d97706" stroke-width="2"/><line x1="420" y1="205" x2="500" y2="140" stroke="#16a34a" stroke-width="3"/><line x1="580" y1="130" x2="610" y2="130" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Staff leave through ISPA. After FBF, lab traffic leaves through ISPB.</p></div>

<h3>Step 1: the forwarding instance</h3>
<pre class="code">set routing-instances ISP-B instance-type forwarding
set routing-instances ISP-B routing-options static route 0.0.0.0/0 next-hop 10.0.2.2
commit</pre>
<pre class="out">lab@R1# run show route table ISP-B.inet.0
ISP-B.inet.0: 0 destinations, 0 routes (0 active, 0 holddown, 0 hidden)</pre>
<p>The table is empty. The default route is configured but not active, because 10.0.2.2 cannot be resolved: ISP-B.inet.0 does not know the connected subnet 10.0.2.0/30.</p>

<h3>Step 2: the RIB group</h3>
<pre class="code">set routing-options rib-groups FBF-RG import-rib [ inet.0 ISP-B.inet.0 ]
set routing-options interface-routes rib-group inet FBF-RG
commit</pre>
<pre class="out">lab@R1# run show route instance
Instance             Type
         Primary RIB                                     Active/holddown/hidden
master               forwarding
         inet.0                                          9/0/0

ISP-B                forwarding
         ISP-B.inet.0                                    9/0/0</pre>
<p>ISP-B now holds nine routes, the default via 10.0.2.2 and the interface routes, as seen in the previous chapter.</p>

<h3>Step 3: the filter and its application</h3>
<pre class="code">set firewall family inet filter STEER-LAB term LAB from source-address 10.1.2.0/24
set firewall family inet filter STEER-LAB term LAB then routing-instance ISP-B
set firewall family inet filter STEER-LAB term REST then accept
set interfaces ge-0/0/3 unit 0 family inet filter input STEER-LAB
commit and-quit</pre>
<pre class="out">lab@R1&gt; show configuration firewall
family inet {
    filter STEER-LAB {
        term LAB {
            from {
                source-address 10.1.2.0/24;
            }
            then {
                routing-instance ISP-B;
            }
        }
        term REST {
            then {
                accept;
            }
        }
    }
}</pre>

<h3>Step 4: prove it with traceroute</h3>
<p>The path of each PC shows which ISP is used. Lab PC2 goes through 10.0.2.2, the ISPB side:</p>
<pre class="out">PC2&gt; trace 198.51.100.10
trace to 198.51.100.10, 8 hops max, press Ctrl+C to stop
 1   10.1.2.1        0.500 ms  0.450 ms  0.480 ms
 2   10.0.2.2        0.700 ms  0.650 ms  0.680 ms
 3   10.9.2.2        0.900 ms  0.850 ms  0.880 ms
 4   *198.51.100.10   1.200 ms (ICMP type:3, code:3, Destination port unreachable)</pre>
<p>Staff PC1 keeps using the default route through ISPA (10.0.1.2):</p>
<pre class="out">PC1&gt; trace 198.51.100.10
trace to 198.51.100.10, 8 hops max, press Ctrl+C to stop
 1   10.1.1.1        0.500 ms  0.450 ms  0.480 ms
 2   10.0.1.2        0.700 ms  0.650 ms  0.680 ms
 3   10.9.1.2        0.900 ms  0.850 ms  0.880 ms
 4   *198.51.100.10   1.200 ms (ICMP type:3, code:3, Destination port unreachable)</pre>
<p>Same destination, two different paths, decided by the source. The last line is the server answering with a port unreachable, which is how traceroute knows it arrived.</p>

<h3>Checklist when it does not work</h3>
<ul>
<li>Is <code>ISP-B.inet.0</code> populated, with an active default route?</li>
<li>Is the filter applied as <b>input</b> on the interface the lab traffic enters?</li>
<li>Is there a final accept term?</li>
<li>Does the return path through ISPB know 10.1.2.0/24? In this lab ISPB has a static route for 10.1.0.0/16 back to R1.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> To move the finance subnet 10.1.3.0/24 to ISP-B as well, add a second source-address line to term LAB or a new term before REST. No change to routing tables is needed, because ISP-B already carries the default route. That is the strength of FBF: policy is separate from topology.</p></div>
<div class="warn"><p><b>Common mistake.</b> Putting the REST term before LAB. The first matching term wins, so everything would be accepted by REST and the lab traffic would never reach ISP-B.</p></div>
<div class="exam"><p><b>Exam trap.</b> The filter name is in the configuration but the question shows no traffic steering. Look at where it is applied. A filter that is defined but not attached to an interface does nothing.</p></div>
<div class="scn"><h4>Cheaper links for the lab</h4><p>A college wanted bulk lab downloads off the primary link. The network team used FBF to send the lab subnet through a second, cheaper ISP and kept staff on the main one. The change took ten minutes and the helpdesk saw no impact, because the REST term was in place before the filter was attached.</p><p><b>Lesson:</b> build the filter completely, then attach it.</p></div>
<div class="iv"><p class="q">"Walk me through configuring FBF for one subnet."</p><p>I create a forwarding instance with a default route to the second provider, add a RIB group so interface routes are copied and the next hop resolves, write a filter with a source match that sets the routing instance and a final accept term, then apply it as an input filter on the ingress interface. I verify with <code>show route table</code> for the instance and a traceroute from a host in the subnet.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: forwarding instance, RIB group, filter, attach as input.</li>
<li>Check <code>show route instance</code> and the instance table before testing.</li>
<li>Traceroute from both subnets proves the split.</li>
<li>First matching term wins; keep REST last.</li>
</ul></div>
`,hi:`
<p>Ab ise step by step banao aur saabit karo ki yeh kaam karta hai. Router R1 ke do ISP links hain: ge-0/0/0 (10.0.1.1/30) ISPA ko aur ge-0/0/1 (10.0.2.1/30) ISPB ko. Staff PC1 ge-0/0/2 (10.1.1.0/24) par aur lab PC2 ge-0/0/3 (10.1.2.0/24) par hai. R1 ka ISPA ki taraf static default route hai. Test target NET router ke peeche 198.51.100.10 par server hai jo dono ISPs se reachable hai.</p>

<div class="dia"><svg viewBox="0 0 680 250" role="img" aria-label="ISP lab topology">
<rect x="20" y="40" width="70" height="40" rx="8" fill="#e2e8f0"/><text x="55" y="65" text-anchor="middle" class="svg-ink" font-size="12">PC1</text>
<rect x="20" y="170" width="70" height="40" rx="8" fill="#e2e8f0"/><text x="55" y="195" text-anchor="middle" class="svg-ink" font-size="12">PC2</text>
<rect x="150" y="90" width="110" height="80" rx="10" fill="#bae6fd"/><text x="205" y="125" text-anchor="middle" class="svg-ink" font-size="14">R1</text><text x="205" y="147" text-anchor="middle" class="svg-muted" font-size="11">FBF yahan</text>
<rect x="340" y="30" width="80" height="45" rx="8" fill="#fde68a"/><text x="380" y="58" text-anchor="middle" class="svg-ink" font-size="13">ISPA</text>
<rect x="340" y="185" width="80" height="45" rx="8" fill="#bbf7d0"/><text x="380" y="213" text-anchor="middle" class="svg-ink" font-size="13">ISPB</text>
<rect x="500" y="105" width="80" height="50" rx="8" fill="#e2e8f0"/><text x="540" y="135" text-anchor="middle" class="svg-ink" font-size="13">NET</text>
<rect x="610" y="110" width="60" height="40" rx="8" fill="#e2e8f0"/><text x="640" y="135" text-anchor="middle" class="svg-ink" font-size="11">SRV</text>
<line x1="90" y1="60" x2="150" y2="105" stroke="#64748b" stroke-width="2"/><line x1="90" y1="190" x2="150" y2="155" stroke="#64748b" stroke-width="2"/>
<line x1="260" y1="105" x2="340" y2="55" stroke="#d97706" stroke-width="2"/><line x1="260" y1="155" x2="340" y2="205" stroke="#16a34a" stroke-width="3"/>
<line x1="420" y1="55" x2="500" y2="120" stroke="#d97706" stroke-width="2"/><line x1="420" y1="205" x2="500" y2="140" stroke="#16a34a" stroke-width="3"/><line x1="580" y1="130" x2="610" y2="130" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Staff ISPA se jaate hain. FBF ke baad lab traffic ISPB se jaata hai.</p></div>

<h3>Step 1: forwarding instance</h3>
<pre class="code">set routing-instances ISP-B instance-type forwarding
set routing-instances ISP-B routing-options static route 0.0.0.0/0 next-hop 10.0.2.2
commit</pre>
<pre class="out">lab@R1# run show route table ISP-B.inet.0
ISP-B.inet.0: 0 destinations, 0 routes (0 active, 0 holddown, 0 hidden)</pre>
<p>Table khali hai. Default route configured hai par active nahi, kyunki 10.0.2.2 resolve nahi hota: ISP-B.inet.0 ko connected subnet 10.0.2.0/30 pata nahi.</p>

<h3>Step 2: RIB group</h3>
<pre class="code">set routing-options rib-groups FBF-RG import-rib [ inet.0 ISP-B.inet.0 ]
set routing-options interface-routes rib-group inet FBF-RG
commit</pre>
<pre class="out">lab@R1# run show route instance
Instance             Type
         Primary RIB                                     Active/holddown/hidden
master               forwarding
         inet.0                                          9/0/0

ISP-B                forwarding
         ISP-B.inet.0                                    9/0/0</pre>
<p>ISP-B ke paas ab nau routes hain, 10.0.2.2 ka default aur interface routes, jaise pichhle chapter mein dekha.</p>

<h3>Step 3: filter aur uska application</h3>
<pre class="code">set firewall family inet filter STEER-LAB term LAB from source-address 10.1.2.0/24
set firewall family inet filter STEER-LAB term LAB then routing-instance ISP-B
set firewall family inet filter STEER-LAB term REST then accept
set interfaces ge-0/0/3 unit 0 family inet filter input STEER-LAB
commit and-quit</pre>
<pre class="out">lab@R1&gt; show configuration firewall
family inet {
    filter STEER-LAB {
        term LAB {
            from {
                source-address 10.1.2.0/24;
            }
            then {
                routing-instance ISP-B;
            }
        }
        term REST {
            then {
                accept;
            }
        }
    }
}</pre>

<h3>Step 4: traceroute se saabit karo</h3>
<p>Har PC ka path batata hai kaunsa ISP use hua. Lab PC2 10.0.2.2, yaani ISPB ki taraf se jaata hai:</p>
<pre class="out">PC2&gt; trace 198.51.100.10
trace to 198.51.100.10, 8 hops max, press Ctrl+C to stop
 1   10.1.2.1        0.500 ms  0.450 ms  0.480 ms
 2   10.0.2.2        0.700 ms  0.650 ms  0.680 ms
 3   10.9.2.2        0.900 ms  0.850 ms  0.880 ms
 4   *198.51.100.10   1.200 ms (ICMP type:3, code:3, Destination port unreachable)</pre>
<p>Staff PC1 default route se ISPA (10.0.1.2) ke through jaata rehta hai:</p>
<pre class="out">PC1&gt; trace 198.51.100.10
trace to 198.51.100.10, 8 hops max, press Ctrl+C to stop
 1   10.1.1.1        0.500 ms  0.450 ms  0.480 ms
 2   10.0.1.2        0.700 ms  0.650 ms  0.680 ms
 3   10.9.1.2        0.900 ms  0.850 ms  0.880 ms
 4   *198.51.100.10   1.200 ms (ICMP type:3, code:3, Destination port unreachable)</pre>
<p>Ek hi destination, do alag path, source se tay hue. Aakhri line server ka port unreachable jawab hai, jisse traceroute jaanta hai ki woh pahunch gaya.</p>

<h3>Kaam na kare to checklist</h3>
<ul>
<li>Kya <code>ISP-B.inet.0</code> bhara hai, active default route ke saath?</li>
<li>Kya filter us interface par <b>input</b> ki tarah laga hai jahan lab traffic aata hai?</li>
<li>Kya aakhri accept term hai?</li>
<li>Kya ISPB ka return path 10.1.2.0/24 jaanta hai? Is lab mein ISPB ke paas R1 ki taraf 10.1.0.0/16 ka static route hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Finance subnet 10.1.3.0/24 ko bhi ISP-B par bhejna ho to term LAB mein doosri source-address line jodo ya REST se pehle naya term. Routing tables mein koi badlav nahi chahiye, kyunki ISP-B ke paas default route pehle se hai. FBF ki taakat yahi hai: policy topology se alag hai.</p></div>
<div class="warn"><p><b>Common mistake.</b> REST term ko LAB se pehle rakhna. Pehla matching term jeetta hai, isliye sab kuch REST accept kar leta aur lab traffic kabhi ISP-B tak nahi pahunchta.</p></div>
<div class="exam"><p><b>Exam trap.</b> Filter ka naam configuration mein hai par sawal mein koi traffic steering nahi dikhti. Dekho woh kahan lagaya gaya hai. Jo filter define hai par interface se attach nahi, kuch nahi karta.</p></div>
<div class="scn"><h4>Lab ke liye sasta link</h4><p>Ek college lab ke bade downloads primary link se hatana chahta tha. Network team ne FBF se lab subnet ko doosre, sasti ISP se bheja aur staff ko main par rakha. Change mein das minute lage aur helpdesk ko koi asar nahi dikha, kyunki filter attach hone se pehle REST term maujood tha.</p><p><b>Lesson:</b> pehle filter poora banao, phir attach karo.</p></div>
<div class="iv"><p class="q">"Ek subnet ke liye FBF configure karne ka tareeka batao."</p><p>Main doosre provider ke default route wala forwarding instance banata hoon, RIB group jodta hoon taaki interface routes copy hon aur next hop resolve ho, source match se routing instance set karne wala aur aakhri accept term wala filter likhta hoon, phir use ingress interface par input filter ki tarah lagata hoon. Verify karne ke liye instance ka <code>show route table</code> aur subnet ke host se traceroute karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: forwarding instance, RIB group, filter, input par attach.</li>
<li>Test se pehle <code>show route instance</code> aur instance table dekho.</li>
<li>Dono subnets se traceroute split saabit karta hai.</li>
<li>Pehla matching term jeetta hai; REST ko last rakho.</li>
</ul></div>
`}};export{e as default};