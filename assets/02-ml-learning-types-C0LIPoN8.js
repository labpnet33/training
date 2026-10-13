var e={id:`ml-types`,h:{en:`AI, ML and deep learning: supervised, unsupervised and reinforcement learning`,hi:`AI, ML aur deep learning: supervised, unsupervised aur reinforcement learning`},body:{en:`
<p>Think about how you learned to read a router's LEDs. Nobody gave you a rulebook with every possible combination. A senior showed you a few examples ("solid green is fine, blinking amber means a fault"), you saw hundreds more on the job, and slowly your brain built its own model. Machine learning works the same way: instead of a programmer writing every rule, an algorithm studies examples and builds a <b>model</b> that it can apply to new cases.</p>

<h3>Rules versus learning</h3>
<p>Classic network monitoring is <b>rule-based</b>: "if CPU is above 90% for 5 minutes, raise an alarm". Rules are simple, predictable and easy to audit, but they are blind to context. 90% CPU on a busy core router at noon may be normal; 40% on a quiet branch router at 3 a.m. may be a problem. <b>Machine learning (ML)</b> learns what is normal for <i>each</i> device and time from the data itself. Rule-based systems are still AI in the broad sense, but they do not learn.</p>
<dl class="terms">
<dt>Dataset</dt><dd>The examples the model learns from, for example six months of interface counters or 10,000 historical tickets.</dd>
<dt>Feature</dt><dd>One input measurement the model looks at: packets per second, CRC errors, hour of day, device role.</dd>
<dt>Label</dt><dd>The correct answer attached to an example, such as "real outage" or "noise". Only supervised learning needs labels.</dd>
<dt>Model</dt><dd>The learned pattern, stored as numbers (parameters or weights).</dd>
<dt>Training</dt><dd>The process of adjusting the model's parameters so that its answers match the data.</dd>
<dt>Inference</dt><dd>Using the trained model on new data to get an answer. Chapter 3 compares training and inference for LLMs.</dd>
</dl>

<h3>The three ways a machine learns</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Supervised, unsupervised and reinforcement learning compared">
<rect x="10" y="10" width="200" height="200" rx="10" fill="#bae6fd"/>
<rect x="220" y="10" width="200" height="200" rx="10" fill="#bbf7d0"/>
<rect x="430" y="10" width="200" height="200" rx="10" fill="#fde68a"/>
<text x="110" y="38" text-anchor="middle" class="svg-ink" font-size="14">Supervised</text>
<text x="110" y="70" text-anchor="middle" class="svg-muted" font-size="12">input: labelled examples</text>
<text x="110" y="95" text-anchor="middle" class="svg-muted" font-size="12">"outage" / "noise"</text>
<text x="110" y="135" text-anchor="middle" class="svg-ink" font-size="12">output: classify or</text>
<text x="110" y="155" text-anchor="middle" class="svg-ink" font-size="12">predict a number</text>
<text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">Unsupervised</text>
<text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">input: data, no labels</text>
<text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">raw alarms, counters</text>
<text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">output: groups (clusters)</text>
<text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="12">and "what is normal"</text>
<text x="530" y="38" text-anchor="middle" class="svg-ink" font-size="14">Reinforcement</text>
<text x="530" y="70" text-anchor="middle" class="svg-muted" font-size="12">input: actions + rewards</text>
<text x="530" y="95" text-anchor="middle" class="svg-muted" font-size="12">trial and error</text>
<text x="530" y="135" text-anchor="middle" class="svg-ink" font-size="12">output: a policy that</text>
<text x="530" y="155" text-anchor="middle" class="svg-ink" font-size="12">picks the best action</text>
</svg><p class="cap">What goes in decides the type of learning: labels, no labels, or rewards.</p></div>

<h4>Supervised learning</h4>
<p>The model learns from <b>labelled examples</b> and then predicts the label for new data. Two flavours: <b>classification</b> predicts a category, <b>regression</b> predicts a number.</p>
<ul>
<li>Classification: "Is this burst of syslog messages a real outage or noise?" trained on past tickets that engineers already closed with a cause.</li>
<li>Classification: identify the application in a flow (video, backup, voice) from features like packet sizes and timing.</li>
<li>Regression: predict next month's peak utilisation of a WAN link from past months.</li>
</ul>

<h4>Unsupervised learning</h4>
<p>The model gets data with <b>no labels</b> and finds structure by itself.</p>
<ul>
<li><b>Clustering</b>: group 300 alarms into a handful of clusters that probably share one cause.</li>
<li><b>Learning normal</b>: build a baseline of each interface's traffic and flag values far outside it (anomaly detection, chapter 4).</li>
<li>Group access points or branches with similar behaviour so that one policy fits each group.</li>
</ul>

<h4>Reinforcement learning (RL)</h4>
<p>An <b>agent</b> takes actions in an environment and receives a <b>reward</b> or penalty; over many tries it learns a policy that maximises reward. Network examples come mostly from research and large providers: choosing paths for traffic engineering, or tuning Wi-Fi channel and power where the reward is better client throughput. It is rare in day-to-day NOC tools because trial and error on a production network is dangerous. One important use you meet every day: chat assistants are fine-tuned with <b>reinforcement learning from human feedback (RLHF)</b>, where people rate answers and the model learns to prefer the helpful ones.</p>

<h3>Where deep learning fits</h3>
<p><b>Deep learning</b> is ML using neural networks with many layers. Its strength is that it learns useful features by itself from raw data such as text, images or long time series, instead of an engineer hand-picking features. The cost is large amounts of data and computing power, and models that are hard to explain. LLMs are deep learning models trained on enormous amounts of text.</p>

<div class="eg"><p><b>Worked example: the 98% accurate useless model.</b> You have 10,000 historical syslog bursts; 200 (2%) were real outages and 9,800 were noise. You train on 8,000 and keep 2,000 aside as a <b>test set</b> the model has never seen. A lazy model that always answers "noise" scores 98% accuracy, yet it misses every outage. That is why engineers also look at <b>false negatives</b> (missed outages) and <b>false positives</b> (false alarms), not only accuracy. For a NOC, missing an outage is usually far worse than one extra alert.</p></div>

<pre class="out">burst_id  msgs_per_min  distinct_devices  has_LINK_DOWN  hour  label
1041      12            1                 no             14    noise
1042      340           27                yes            02    <span class="hl">outage</span>
1043      45            3                 no             09    noise</pre>
<p>Each row is an example, each column before <code>label</code> is a feature. The label column is what makes this supervised.</p>

<div class="warn"><p><b>Common mistakes.</b> Training on dirty data (tickets closed with the wrong cause teach the model the wrong thing: garbage in, garbage out). Testing on the same data used for training, which hides <b>overfitting</b> (the model memorised the examples instead of learning the pattern). Forgetting that the network changes: a model trained before a big migration may be stale.</p></div>
<div class="exam"><p><b>Exam trap.</b> Labels mean supervised. No labels means unsupervised. Rewards from trial and error mean reinforcement. "Grouping similar alarms" is unsupervised clustering; "predicting whether a ticket is a hardware fault from past labelled tickets" is supervised classification.</p></div>

<div class="scn"><h4>The alarm classifier that learned laziness</h4><p>An operator trained a supervised model to decide which alarms deserved a page at night. It reported 97% accuracy and was switched on. Two weeks later a core link failure did not page anyone. The team found that most historical tickets for that alarm type had been closed as "no action", because the link had redundancy, so the model had learned "this alarm never matters". They rebalanced the training data, added a rule that any core link alarm always pages, and measured missed outages instead of plain accuracy.</p><p><b>Lesson:</b> a model is only as good as its labels, and accuracy alone can hide dangerous misses.</p></div>

<div class="iv"><p class="q">"Explain supervised versus unsupervised learning with a networking example."</p><p>Strong answer: supervised learns from labelled examples, such as past tickets tagged "fibre cut" or "power", and then classifies new events; unsupervised has no labels and finds structure, such as clustering related alarms or learning a traffic baseline for anomaly detection. Add reinforcement learning as learning from rewards, mention it is rare in production NOCs, and bonus points for mentioning class imbalance or false negatives.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rule-based systems follow fixed rules; ML learns patterns from data.</li>
<li>Supervised = labelled examples (classification or regression); unsupervised = no labels (clustering, baselines); reinforcement = rewards from trial and error.</li>
<li>Deep learning uses many-layered neural networks and learns features itself; LLMs are deep learning.</li>
<li>Always test on unseen data and watch false negatives, not just accuracy.</li>
<li>Data quality decides model quality: garbage in, garbage out.</li>
</ul></div>
`,hi:`
<p>Socho aapne router ke LEDs padhna kaise seekha. Kisi ne aapko har possible combination wali rulebook nahi di. Ek senior ne kuch examples dikhaye ("solid green theek hai, blinking amber matlab fault"), aapne job par sainkdon aur dekhe, aur dheere-dheere aapke dimaag ne apna model bana liya. Machine learning bhi aise hi kaam karta hai: programmer har rule likhne ki jagah, algorithm examples study karta hai aur ek <b>model</b> banata hai jise woh naye cases par apply kar sake.</p>

<h3>Rules versus learning</h3>
<p>Classic network monitoring <b>rule-based</b> hoti hai: "agar CPU 5 minute tak 90% se upar hai, alarm raise karo". Rules simple, predictable aur audit karne mein aasaan hote hain, lekin context nahi dekhte. Dopahar mein busy core router par 90% CPU normal ho sakta hai; raat 3 baje quiet branch router par 40% problem ho sakta hai. <b>Machine learning (ML)</b> data se hi seekhta hai ki <i>har</i> device aur time ke liye normal kya hai. Rule-based systems broad sense mein AI hi hain, lekin woh seekhte nahi.</p>
<dl class="terms">
<dt>Dataset</dt><dd>Woh examples jinse model seekhta hai, jaise chhe mahine ke interface counters ya 10,000 purane tickets.</dd>
<dt>Feature</dt><dd>Ek input measurement jise model dekhta hai: packets per second, CRC errors, din ka ghanta, device role.</dd>
<dt>Label</dt><dd>Example ke saath juda sahi jawab, jaise "real outage" ya "noise". Labels sirf supervised learning ko chahiye.</dd>
<dt>Model</dt><dd>Seekha hua pattern, numbers (parameters ya weights) ke roop mein store.</dd>
<dt>Training</dt><dd>Model ke parameters adjust karne ka process taaki uske jawab data se match karein.</dd>
<dt>Inference</dt><dd>Trained model ko naye data par use karke jawab lena. Chapter 3 LLMs ke liye training aur inference compare karta hai.</dd>
</dl>

<h3>Machine ke seekhne ke teen tareeke</h3>
<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Supervised, unsupervised aur reinforcement learning ka comparison">
<rect x="10" y="10" width="200" height="200" rx="10" fill="#bae6fd"/>
<rect x="220" y="10" width="200" height="200" rx="10" fill="#bbf7d0"/>
<rect x="430" y="10" width="200" height="200" rx="10" fill="#fde68a"/>
<text x="110" y="38" text-anchor="middle" class="svg-ink" font-size="14">Supervised</text>
<text x="110" y="70" text-anchor="middle" class="svg-muted" font-size="12">input: labelled examples</text>
<text x="110" y="95" text-anchor="middle" class="svg-muted" font-size="12">"outage" / "noise"</text>
<text x="110" y="135" text-anchor="middle" class="svg-ink" font-size="12">output: classify ya</text>
<text x="110" y="155" text-anchor="middle" class="svg-ink" font-size="12">number predict</text>
<text x="320" y="38" text-anchor="middle" class="svg-ink" font-size="14">Unsupervised</text>
<text x="320" y="70" text-anchor="middle" class="svg-muted" font-size="12">input: data, labels nahi</text>
<text x="320" y="95" text-anchor="middle" class="svg-muted" font-size="12">raw alarms, counters</text>
<text x="320" y="135" text-anchor="middle" class="svg-ink" font-size="12">output: groups (clusters)</text>
<text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="12">aur "normal kya hai"</text>
<text x="530" y="38" text-anchor="middle" class="svg-ink" font-size="14">Reinforcement</text>
<text x="530" y="70" text-anchor="middle" class="svg-muted" font-size="12">input: actions + rewards</text>
<text x="530" y="95" text-anchor="middle" class="svg-muted" font-size="12">trial aur error</text>
<text x="530" y="135" text-anchor="middle" class="svg-ink" font-size="12">output: policy jo best</text>
<text x="530" y="155" text-anchor="middle" class="svg-ink" font-size="12">action chunti hai</text>
</svg><p class="cap">Andar kya jaata hai, wahi learning ka type decide karta hai: labels, bina labels, ya rewards.</p></div>

<h4>Supervised learning</h4>
<p>Model <b>labelled examples</b> se seekhta hai aur phir naye data ka label predict karta hai. Do flavours: <b>classification</b> category predict karta hai, <b>regression</b> number predict karta hai.</p>
<ul>
<li>Classification: "Kya syslog messages ka yeh burst real outage hai ya noise?" un purane tickets par trained jinhe engineers ne pehle hi cause ke saath close kiya.</li>
<li>Classification: flow ki application (video, backup, voice) packet sizes aur timing jaise features se pehchanna.</li>
<li>Regression: pichhle mahino se WAN link ka agle mahine ka peak utilisation predict karna.</li>
</ul>

<h4>Unsupervised learning</h4>
<p>Model ko <b>bina labels</b> ka data milta hai aur woh khud structure dhoondhta hai.</p>
<ul>
<li><b>Clustering</b>: 300 alarms ko kuch clusters mein group karna jinka shayad ek hi cause hai.</li>
<li><b>Normal seekhna</b>: har interface ke traffic ka baseline banana aur usse bahut door ki values flag karna (anomaly detection, chapter 4).</li>
<li>Same behaviour wale access points ya branches ko group karna taaki har group par ek policy fit ho.</li>
</ul>

<h4>Reinforcement learning (RL)</h4>
<p>Ek <b>agent</b> environment mein actions leta hai aur <b>reward</b> ya penalty paata hai; bahut saari koshishon ke baad woh aisi policy seekhta hai jo reward maximise kare. Network examples zyada tar research aur bade providers se aate hain: traffic engineering ke liye paths chunna, ya Wi-Fi channel aur power tune karna jahan reward behtar client throughput hai. Roz ke NOC tools mein yeh rare hai kyunki production network par trial aur error khatarnaak hai. Ek important use jo aap roz dekhte ho: chat assistants <b>reinforcement learning from human feedback (RLHF)</b> se fine-tune hote hain, jahan log jawabon ko rate karte hain aur model helpful jawab prefer karna seekhta hai.</p>

<h3>Deep learning kahan fit hota hai</h3>
<p><b>Deep learning</b> bahut layers wale neural networks use karne wala ML hai. Iski taakat yeh hai ki yeh raw data (text, images ya lambi time series) se useful features khud seekh leta hai, engineer ko features haath se chunne nahi padte. Keemat hai bahut zyada data aur computing power, aur aise models jinhe explain karna mushkil hai. LLMs bahut zyada text par trained deep learning models hain.</p>

<div class="eg"><p><b>Worked example: 98% accurate bekaar model.</b> Aapke paas 10,000 purane syslog bursts hain; 200 (2%) real outages the aur 9,800 noise. Aap 8,000 par train karte ho aur 2,000 ko <b>test set</b> ki tarah alag rakhte ho jo model ne kabhi nahi dekha. Ek aalsi model jo hamesha "noise" bolta hai, 98% accuracy score karta hai, phir bhi har outage miss karta hai. Isiliye engineers sirf accuracy nahi, <b>false negatives</b> (miss hue outages) aur <b>false positives</b> (jhoothe alarms) bhi dekhte hain. NOC ke liye outage miss karna aam taur par ek extra alert se kahin bura hai.</p></div>

<pre class="out">burst_id  msgs_per_min  distinct_devices  has_LINK_DOWN  hour  label
1041      12            1                 no             14    noise
1042      340           27                yes            02    <span class="hl">outage</span>
1043      45            3                 no             09    noise</pre>
<p>Har row ek example hai, <code>label</code> se pehle ka har column ek feature hai. Label column hi ise supervised banata hai.</p>

<div class="warn"><p><b>Common galtiyan.</b> Gande data par training (galat cause ke saath close hue tickets model ko galat cheez sikhate hain: garbage in, garbage out). Usi data par test karna jis par training hui, jisse <b>overfitting</b> chhup jaata hai (model ne pattern seekhne ki jagah examples ratt liye). Yeh bhoolna ki network badalta hai: badi migration se pehle trained model stale ho sakta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Labels matlab supervised. Labels nahi matlab unsupervised. Trial aur error se rewards matlab reinforcement. "Similar alarms ko group karna" unsupervised clustering hai; "purane labelled tickets se predict karna ki ticket hardware fault hai ya nahi" supervised classification hai.</p></div>

<div class="scn"><h4>Alarm classifier jisne aalas seekh liya</h4><p>Ek operator ne supervised model train kiya jo decide kare ki raat mein kaunse alarms par page karna hai. Usne 97% accuracy report ki aur on kar diya gaya. Do hafte baad ek core link failure par kisi ko page nahi gaya. Team ne dekha ki us alarm type ke zyada tar purane tickets "no action" ke saath close hue the, kyunki link par redundancy thi, isliye model ne seekh liya tha "yeh alarm kabhi matter nahi karta". Unhone training data rebalance kiya, rule joda ki koi bhi core link alarm hamesha page karega, aur plain accuracy ki jagah miss hue outages naapne lage.</p><p><b>Seekh:</b> model utna hi achha hai jitne uske labels, aur sirf accuracy khatarnaak misses chhupa sakti hai.</p></div>

<div class="iv"><p class="q">"Supervised aur unsupervised learning ko networking example ke saath explain karo."</p><p>Strong answer: supervised labelled examples se seekhta hai, jaise "fibre cut" ya "power" tag wale purane tickets, aur phir naye events classify karta hai; unsupervised ke paas labels nahi hote aur woh structure dhoondhta hai, jaise related alarms ko cluster karna ya anomaly detection ke liye traffic baseline seekhna. Reinforcement learning ko rewards se seekhna bata kar jodo, bolo ki production NOCs mein yeh rare hai, aur class imbalance ya false negatives ka zikr karo to bonus points.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Rule-based systems fixed rules follow karte hain; ML data se patterns seekhta hai.</li>
<li>Supervised = labelled examples (classification ya regression); unsupervised = labels nahi (clustering, baselines); reinforcement = trial aur error se rewards.</li>
<li>Deep learning bahut layers wale neural networks use karta hai aur features khud seekhta hai; LLMs deep learning hain.</li>
<li>Hamesha unseen data par test karo aur sirf accuracy nahi, false negatives bhi dekho.</li>
<li>Data quality hi model quality decide karti hai: garbage in, garbage out.</li>
</ul></div>
`}};export{e as default};