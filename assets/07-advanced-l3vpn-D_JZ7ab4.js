var e={id:`advanced-l3vpn`,h:{en:`Beyond one AS: inter-AS, CSC, 6VPE, mVPN, EVPN (overview)`,hi:`Ek AS se aage: inter-AS, CSC, 6VPE, mVPN, EVPN (overview)`},body:{en:`
<p>The SPCOR exam asks conceptual questions about extensions of L3VPN. None of the following is simulated in the labs, so this chapter is <b>concept only</b>: no command output is shown, and the snippets are labelled reference configuration.</p>

<h3>Inter-AS MPLS VPN</h3>
<p>When a customer VPN spans two providers (or two ASes of one provider), the VPN routes must cross the AS boundary. There are three options:</p>
<table class="cmp"><tr><th>Option</th><th>How it works</th><th>Trade-off</th></tr>
<tr><td>A: back-to-back VRF</td><td>ASBRs act as PE and CE for each other, one sub-interface and VRF per VPN</td><td>Simple, but does not scale: one interface per VPN</td></tr>
<tr><td>B: MP-eBGP between ASBRs</td><td>ASBRs exchange VPNv4 routes and labels with eBGP; ASBR re-originates with next-hop-self</td><td>Scales better; ASBRs hold all VPN routes; label swap at ASBR</td></tr>
<tr><td>C: multihop eBGP between RRs</td><td>VPNv4 exchanged between route reflectors; ASBRs exchange PE loopbacks with labels (BGP-LU)</td><td>Best scale; needs end-to-end LSP and trust between providers</td></tr></table>

<h3>Carrier Supporting Carrier (CSC)</h3>
<p>A customer carrier uses another provider's MPLS backbone to link its own sites. The backbone carrier sees only the customer carrier's internal routes and labels, not the end customers' routes. The link between customer-carrier CE and backbone PE carries labels (LDP or BGP with labels). Think of it as an L3VPN whose customer is itself an MPLS provider.</p>

<h3>6VPE</h3>
<p>Carries IPv6 customer VPNs over an IPv4 MPLS core. The PEs use VPNv6 in MP-BGP; the next hop is the IPv4-mapped IPv6 address of the PE loopback. The P routers need no IPv6.</p>

<h3>Multicast VPN (mVPN)</h3>
<p>Carries customer multicast across the VPN. Legacy design (Draft Rosen) builds a default multicast distribution tree with GRE between PEs; newer designs (NG-MVPN, profiles) use MP-BGP address families for signalling and P2MP LSPs (mLDP or RSVP-TE) in the core. Only the idea is tested.</p>

<h3>EVPN</h3>
<p>EVPN uses MP-BGP to advertise MAC and IP routes. It can replace VPLS for Layer 2 services and also provides Layer 3 (IP prefix) routes. Benefits: all-active multihoming, MAC learning in the control plane, less flooding.</p>

<h3>Internet access from a VRF</h3>
<p>Options (concept): a default route in the VRF pointing at the global table; a dedicated internet VRF; or a central firewall. All must avoid leaking customer routes into the global table.</p>

<div class="eg"><p><b>Worked example.</b> Customer VPN across two providers: option A for 3 VPNs (simple), option B or C for 300 VPNs (scale). A bank, with its own MPLS backbone linking branches, would buy CSC from a backbone carrier.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Calling CSC "inter-AS". Thinking option B needs a VRF on the ASBRs (it does not). Forgetting that option C needs the PE loopbacks with labels across the boundary.</p></div>
<div class="exam"><p><b>Exam trap.</b> Option A uses VRFs on the ASBRs; option B holds VPNv4 routes on the ASBRs without VRFs; option C keeps VPNv4 routes only on the RRs and PEs.</p></div>

<div class="scn"><h4>Two carriers, one VPN</h4><p>A multinational needs one VPN across two providers. With 5 VPNs, option A (one VRF and sub-interface each) was acceptable. When it grew to hundreds, the providers moved to option B to avoid per-VPN interfaces.</p><p><b>Lesson:</b> scale pushes you from A to B or C.</p></div>

<div class="iv"><p class="q">"What are the three inter-AS L3VPN options?"</p><p>A is back-to-back VRFs on the ASBRs. B is MP-eBGP VPNv4 between the ASBRs. C is multihop MP-eBGP VPNv4 between route reflectors with labelled PE loopbacks exchanged between ASBRs.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inter-AS: A (VRF per VPN), B (VPNv4 between ASBRs), C (RR to RR).</li>
<li>CSC: a carrier is the customer of a backbone carrier.</li>
<li>6VPE carries IPv6 VPNs over an IPv4 core.</li>
<li>mVPN and EVPN extend VPN services; know the idea only.</li>
<li>None of this is simulated; it is concept.</li>
</ul></div>
`,hi:`
<p>SPCOR exam L3VPN ke extensions par conceptual sawaal poochta hai. Neeche kuch bhi lab mein simulate nahi hota, isliye yeh chapter <b>sirf concept</b> hai: koi command output nahi dikhaya gaya.</p>

<h3>Inter-AS MPLS VPN</h3>
<p>Jab customer VPN do providers (ya ek provider ke do ASes) mein phaila ho, VPN routes ko AS boundary paar karni padti hai. Teen options hain:</p>
<table class="cmp"><tr><th>Option</th><th>Kaise kaam karta hai</th><th>Trade-off</th></tr>
<tr><td>A: back-to-back VRF</td><td>ASBRs ek doosre ke liye PE aur CE ki tarah kaam karte hain, har VPN ke liye ek sub-interface aur VRF</td><td>Simple, par scale nahi karta: har VPN ke liye ek interface</td></tr>
<tr><td>B: ASBRs ke beech MP-eBGP</td><td>ASBRs eBGP se VPNv4 routes aur labels exchange karte hain; ASBR next-hop-self ke saath re-originate karta hai</td><td>Behtar scale; ASBRs saare VPN routes rakhte hain; ASBR par label swap</td></tr>
<tr><td>C: RRs ke beech multihop eBGP</td><td>VPNv4 route reflectors ke beech exchange hota hai; ASBRs PE loopbacks labels ke saath exchange karte hain (BGP-LU)</td><td>Sabse achha scale; end-to-end LSP aur providers ke beech trust chahiye</td></tr></table>

<h3>Carrier Supporting Carrier (CSC)</h3>
<p>Ek customer carrier apne sites jodne ke liye doosre provider ka MPLS backbone use karta hai. Backbone carrier sirf customer carrier ke internal routes aur labels dekhta hai, end customers ke routes nahi. Customer-carrier CE aur backbone PE ke beech link labels carry karta hai (LDP ya labels ke saath BGP). Ise aise L3VPN ki tarah socho jiska customer khud ek MPLS provider hai.</p>

<h3>6VPE</h3>
<p>IPv4 MPLS core par IPv6 customer VPNs carry karta hai. PEs MP-BGP mein VPNv6 use karte hain; next hop PE loopback ka IPv4-mapped IPv6 address hota hai. P routers ko IPv6 nahi chahiye.</p>

<h3>Multicast VPN (mVPN)</h3>
<p>Customer multicast ko VPN ke paar carry karta hai. Purana design (Draft Rosen) PEs ke beech GRE ke saath default multicast distribution tree banata hai; naye designs (NG-MVPN, profiles) signalling ke liye MP-BGP address families aur core mein P2MP LSPs (mLDP ya RSVP-TE) use karte hain. Sirf idea test hota hai.</p>

<h3>EVPN</h3>
<p>EVPN MP-BGP se MAC aur IP routes advertise karta hai. Yeh Layer 2 services ke liye VPLS ki jagah le sakta hai aur Layer 3 (IP prefix) routes bhi deta hai. Fayde: all-active multihoming, control plane mein MAC learning, kam flooding.</p>

<h3>VRF se internet access</h3>
<p>Options (concept): VRF mein default route jo global table ki taraf point kare; dedicated internet VRF; ya central firewall. Sabko customer routes ko global table mein leak hone se bachana hai.</p>

<div class="eg"><p><b>Worked example.</b> Do providers ke beech customer VPN: 3 VPNs ke liye option A (simple), 300 VPNs ke liye option B ya C (scale). Ek bank jiska apna MPLS backbone branches jodta hai, backbone carrier se CSC kharidega.</p></div>

<div class="warn"><p><b>Common mistakes.</b> CSC ko "inter-AS" kehna. Sochna ki option B ko ASBRs par VRF chahiye (nahi chahiye). Bhoolna ki option C ko boundary ke paar labels ke saath PE loopbacks chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Option A ASBRs par VRFs use karta hai; option B ASBRs par VRFs ke bina VPNv4 routes rakhta hai; option C VPNv4 routes sirf RRs aur PEs par rakhta hai.</p></div>

<div class="scn"><h4>Do carriers, ek VPN</h4><p>Ek multinational ko do providers ke paar ek VPN chahiye. 5 VPNs ke saath option A (har ek ke liye VRF aur sub-interface) theek tha. Jab saikdon ho gaye, providers per-VPN interfaces se bachne ke liye option B par gaye.</p><p><b>Lesson:</b> scale A se B ya C ki taraf dhakelta hai.</p></div>

<div class="iv"><p class="q">"Inter-AS L3VPN ke teen options kya hain?"</p><p>A ASBRs par back-to-back VRFs hai. B ASBRs ke beech MP-eBGP VPNv4 hai. C route reflectors ke beech multihop MP-eBGP VPNv4 hai, aur ASBRs ke beech labelled PE loopbacks exchange hote hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Inter-AS: A (har VPN ke liye VRF), B (ASBRs ke beech VPNv4), C (RR se RR).</li>
<li>CSC: ek carrier backbone carrier ka customer hai.</li>
<li>6VPE IPv4 core par IPv6 VPNs carry karta hai.</li>
<li>mVPN aur EVPN VPN services badhate hain; sirf idea jaano.</li>
<li>Kuch bhi simulate nahi hota; yeh concept hai.</li>
</ul></div>
`}};export{e as default};