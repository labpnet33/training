var e={id:`cli-modes`,h:{en:`The PAN-OS CLI: operational mode, configure mode and the hierarchy`,hi:`PAN-OS CLI: operational mode, configure mode aur hierarchy`},body:{en:`
<p><b>Analogy: reading a file versus editing it.</b> In operational mode you only <i>look</i> at the firewall, like opening a document read-only. In configure mode you <i>edit</i> a working copy. Keeping the two separate stops you from changing production while you only meant to look.</p>

<h3>Two modes, two prompts</h3>
<table class="cmp"><tr><th>Mode</th><th>Prompt</th><th>Use it for</th></tr>
<tr><td>Operational</td><td><code>admin@PA1&gt;</code></td><td>show, test, ping, traceroute, clear, request</td></tr>
<tr><td>Configure</td><td><code>admin@PA1#</code></td><td>set, delete, edit, show (candidate), commit, revert config</td></tr></table>
<p>Type <code>configure</code> to enter configure mode. You see "Entering configuration mode" and a line <code>[edit]</code> that shows where you are in the configuration. Type <code>exit</code> to leave. The prompt shows the hostname, so after the lab's first commit the name becomes NK-PUNE-PA.</p>
<p>Two practical remarks. In the real PAN-OS CLI, pressing <b>?</b> lists the possible next words and Tab completes them. The simulator does not implement the question mark, so use the lab hints and the command lists in these chapters. Also, a command typed wrongly in the simulator returns " Invalid syntax." Here is what a wrong IP and a misspelt keyword look like:</p>
<pre class="out">admin@PA1# set network interface ethernet ethernet1/2 layer3 ip 10.0.1.300/24
<span class="hl"> Invalid syntax.</span>

admin@PA1# set network interface etherent ethernet1/2
<span class="hl"> Invalid syntax.</span></pre>

<h3>The configuration hierarchy</h3>
<p>The configuration is a tree. A <code>set</code> command is a full path from the top down to a value. For example, the hostname lives under <code>deviceconfig system</code>, an interface under <code>network interface ethernet</code>, a zone under <code>zone</code>. <code>show</code> in configure mode prints a branch of the candidate:</p>
<pre class="out">admin@PA1# set zone trust network layer3 [ ethernet1/2 ethernet1/3 ]
admin@PA1# show zone
zone {
  trust {
    network {
      <span class="hl">layer3 [ ethernet1/2 ethernet1/3 ];</span>
    }
  }
}</pre>
<p>The square brackets are a <b>member list</b>. You can add several members in one command, as above. Later <code>set</code> commands <b>add</b> to a list. To remove one member, use delete with the member name:</p>
<pre class="out">admin@PA1# delete zone trust network layer3 ethernet1/3
admin@PA1# show zone
zone {
  trust {
    network {
      <span class="hl">layer3 ethernet1/2;</span>
    }
  }
}</pre>

<h3>Moving around: edit, up, top, run</h3>
<p>Typing long paths gets tiring. <code>edit</code> moves you into a branch, and the commands that follow are relative to it. The <code>[edit ...]</code> line tells you where you are:</p>
<pre class="out">admin@PA1# edit zone trust
[edit zone trust]
admin@PA1# show
trust {
  network {
    layer3 ethernet1/2;
  }
}
admin@PA1# up
[edit]
admin@PA1# top
[edit]
admin@PA1# run show jobs all
Enqueued              Dequeued              ID    Type        Status  Result  Completed
-----------------------------------------------------------------------------------------------
2026-10-02 04:11:28   2026-10-02 04:11:28   2     Commit      FIN     OK      2026-10-02 04:11:28</pre>
<p><code>up</code> goes one level toward the root, <code>top</code> returns to the root, and <code>run</code> executes an operational command without leaving configure mode (handy for a quick <code>run ping</code> or <code>run show interface all</code>).</p>

<h3>Output as set commands</h3>
<p>PAN-OS prints configuration as braces by default. Change the output format to <code>set</code> lines, which are easier to copy and compare:</p>
<pre class="out">admin@PA1&gt; set cli config-output-format set
admin@PA1&gt; show config running
set deviceconfig system hostname PA1
set network virtual-router default</pre>
<p>The same line works in default format again with <code>set cli config-output-format default</code>.</p>

<div class="eg"><p><b>Worked example.</b> You need three changes in the zone branch. Instead of typing <code>set zone trust ...</code> three times, <code>edit zone trust</code>, make the three edits with shorter commands, then <code>top</code> before you change the network branch. Always check the <code>[edit ...]</code> line before you type a relative command.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Running <code>show</code> in configure mode and thinking it shows the running configuration (it shows the candidate). Forgetting that a list command adds members rather than replacing them. Typing a relative command while still inside an <code>edit</code> branch from earlier.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Which mode do you use to view the running configuration?" Operational mode with <code>show config running</code>. In configure mode, <code>show</code> displays the candidate. Also remember <code>run</code> for operational commands in configure mode.</p></div>

<div class="scn"><h4>The relative command that landed in the wrong place</h4><p>An engineer had used <code>edit network interface ethernet ethernet1/2</code> to set an IP, then typed <code>set zone trust network layer3 ethernet1/2</code> without going to the top. The command failed with invalid syntax and he assumed the zone existed anyway. Later the interface had no zone. The prompt line <code>[edit network interface ethernet ethernet1/2]</code> had been visible the whole time.</p><p><b>Lesson:</b> read the [edit] line, and type <code>top</code> before switching branches.</p></div>

<div class="iv"><p class="q">"How do you view the running and candidate configurations in the CLI?"</p><p>From operational mode, <code>show config running</code> shows what is enforced and <code>show config candidate</code> shows the draft. In configure mode, <code>show</code> displays the candidate, and <code>run show config running</code> shows the running copy. Add that <code>set cli config-output-format set</code> prints set commands.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>&gt; is operational; # is configure; the [edit] line shows your position.</li>
<li>set walks the tree; member lists use square brackets and add on each set.</li>
<li>delete removes an object or one list member.</li>
<li>edit, up and top move around; run executes operational commands.</li>
<li>set cli config-output-format set prints config as set lines.</li>
</ul></div>
`,hi:`
<p><b>Analogy: file padhna versus edit karna.</b> Operational mode mein aap sirf firewall ko <i>dekhte</i> ho, jaise document read-only kholna. Configure mode mein aap working copy <i>edit</i> karte ho. Dono ko alag rakhne se aap production nahi badalte jab aap sirf dekhna chahte the.</p>

<h3>Do modes, do prompts</h3>
<table class="cmp"><tr><th>Mode</th><th>Prompt</th><th>Kis liye</th></tr>
<tr><td>Operational</td><td><code>admin@PA1&gt;</code></td><td>show, test, ping, traceroute, clear, request</td></tr>
<tr><td>Configure</td><td><code>admin@PA1#</code></td><td>set, delete, edit, show (candidate), commit, revert config</td></tr></table>
<p>Configure mode mein jaane ke liye <code>configure</code> type karo. Aapko "Entering configuration mode" aur ek <code>[edit]</code> line dikhti hai jo batati hai ki aap configuration mein kahan ho. Bahar aane ke liye <code>exit</code>. Prompt hostname dikhata hai, isliye lab ke pehle commit ke baad naam NK-PUNE-PA ho jaata hai.</p>
<p>Do practical baatein. Real PAN-OS CLI mein <b>?</b> dabane se agle possible words list hote hain aur Tab unhe complete karta hai. Simulator question mark implement nahi karta, isliye lab hints aur in chapters ki command lists use karo. Aur simulator mein galat type kiya command " Invalid syntax." deta hai. Galat IP aur galat spelling ka keyword aise dikhte hain:</p>
<pre class="out">admin@PA1# set network interface ethernet ethernet1/2 layer3 ip 10.0.1.300/24
<span class="hl"> Invalid syntax.</span>

admin@PA1# set network interface etherent ethernet1/2
<span class="hl"> Invalid syntax.</span></pre>

<h3>Configuration hierarchy</h3>
<p>Configuration ek tree hai. <code>set</code> command upar se neeche value tak ka poora path hota hai. Jaise hostname <code>deviceconfig system</code> ke neeche, interface <code>network interface ethernet</code> ke neeche, zone <code>zone</code> ke neeche. Configure mode mein <code>show</code> candidate ki ek branch print karta hai:</p>
<pre class="out">admin@PA1# set zone trust network layer3 [ ethernet1/2 ethernet1/3 ]
admin@PA1# show zone
zone {
  trust {
    network {
      <span class="hl">layer3 [ ethernet1/2 ethernet1/3 ];</span>
    }
  }
}</pre>
<p>Square brackets <b>member list</b> hain. Aap ek command mein kai members jod sakte ho, jaise upar. Baad ke <code>set</code> commands list mein <b>jodte</b> hain. Ek member hatane ke liye member ke naam ke saath delete use karo:</p>
<pre class="out">admin@PA1# delete zone trust network layer3 ethernet1/3
admin@PA1# show zone
zone {
  trust {
    network {
      <span class="hl">layer3 ethernet1/2;</span>
    }
  }
}</pre>

<h3>Ghoomna: edit, up, top, run</h3>
<p>Lambe paths type karna thaka deta hai. <code>edit</code> aapko ek branch ke andar le jaata hai, aur aage ke commands uske relative hote hain. <code>[edit ...]</code> line batati hai ki aap kahan ho:</p>
<pre class="out">admin@PA1# edit zone trust
[edit zone trust]
admin@PA1# show
trust {
  network {
    layer3 ethernet1/2;
  }
}
admin@PA1# up
[edit]
admin@PA1# top
[edit]
admin@PA1# run show jobs all
Enqueued              Dequeued              ID    Type        Status  Result  Completed
-----------------------------------------------------------------------------------------------
2026-10-02 04:11:28   2026-10-02 04:11:28   2     Commit      FIN     OK      2026-10-02 04:11:28</pre>
<p><code>up</code> root ki taraf ek level jaata hai, <code>top</code> root par wapas laata hai, aur <code>run</code> configure mode chhode bina operational command chalata hai (quick <code>run ping</code> ya <code>run show interface all</code> ke liye kaam ka).</p>

<h3>Output set commands ki tarah</h3>
<p>PAN-OS configuration default mein braces mein print karta hai. Output format ko <code>set</code> lines mein badlo, jo copy aur compare karne mein aasan hain:</p>
<pre class="out">admin@PA1&gt; set cli config-output-format set
admin@PA1&gt; show config running
set deviceconfig system hostname PA1
set network virtual-router default</pre>
<p>Default format wapas lane ke liye <code>set cli config-output-format default</code>.</p>

<div class="eg"><p><b>Worked example.</b> Zone branch mein aapko teen changes chahiye. <code>set zone trust ...</code> teen baar type karne ke bajaye <code>edit zone trust</code>, chhote commands se teen edits, phir network branch badalne se pehle <code>top</code>. Relative command type karne se pehle hamesha <code>[edit ...]</code> line dekho.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Configure mode mein <code>show</code> chalakar sochna ki yeh running configuration hai (yeh candidate dikhata hai). Yeh bhool jaana ki list command members jodta hai, replace nahi karta. Pehle ki <code>edit</code> branch ke andar rehte hue relative command type karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Running configuration dekhne ke liye kaunsa mode?" Operational mode mein <code>show config running</code>. Configure mode mein <code>show</code> candidate dikhata hai. Configure mode mein operational commands ke liye <code>run</code> bhi yaad rakho.</p></div>

<div class="scn"><h4>Relative command jo galat jagah gaya</h4><p>Ek engineer ne IP set karne ke liye <code>edit network interface ethernet ethernet1/2</code> use kiya tha, phir top par gaye bina <code>set zone trust network layer3 ethernet1/2</code> type kiya. Command invalid syntax ke saath fail hua aur usne maan liya ki zone phir bhi ban gaya. Baad mein interface ka koi zone nahi tha. Prompt line <code>[edit network interface ethernet ethernet1/2]</code> poore time dikh rahi thi.</p><p><b>Lesson:</b> [edit] line padho, aur branch badalne se pehle <code>top</code> type karo.</p></div>

<div class="iv"><p class="q">"CLI mein running aur candidate configuration kaise dekhte ho?"</p><p>Operational mode se <code>show config running</code> enforce hoti configuration dikhata hai aur <code>show config candidate</code> draft. Configure mode mein <code>show</code> candidate dikhata hai, aur <code>run show config running</code> running copy. Yeh jodo ki <code>set cli config-output-format set</code> set commands print karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>&gt; operational hai; # configure hai; [edit] line aapki position dikhati hai.</li>
<li>set tree par chalta hai; member lists square brackets mein hoti hain aur har set par badhti hain.</li>
<li>delete object ya list ka ek member hatata hai.</li>
<li>edit, up aur top ghoomte hain; run operational commands chalata hai.</li>
<li>set cli config-output-format set config ko set lines mein print karta hai.</li>
</ul></div>
`}};export{e as default};