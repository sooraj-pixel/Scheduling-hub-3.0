import CourseCard from '@/components/CourseCard'
import Layout from '@/components/design/Layout'
import Section from '@/components/Section'
import { programs } from '@/public/constants'

const Programs = () => {
    return (
        <Layout>
            <Section title={"Explore our Programs"}>
                <div>
                    {Object.keys(programs).map((category) => (
                        <div key={category} className='mt-10'>
                            <h2 className='h2 mb-5'>{category}</h2>
                            <div className='grid grid-cols-2 lg:grid-cols-3 gap-5'>
                                {programs[category].map((program, index) => (
                                    <CourseCard key={index} {...program} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </Section>
        </Layout>
    )
}
export default Programs