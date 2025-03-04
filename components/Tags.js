import Link from 'next/link'

const Tags = ({ tags, currentTag }) => {
  if (!tags) return null
  return (
    <div className="tag-container">
      <ul className="flex flex-wrap gap-2 mt-4">  {/* 修改这行 */}
        {Object.keys(tags).map(key => {
          const selected = key === currentTag
          return (
            <li
              key={key}
              className={`font-medium border whitespace-normal ${  /* 移除 mr-3，添加 whitespace-normal */
                selected
                  ? 'text-white bg-black border-black dark:bg-gray-600 dark:border-gray-600'
                  : 'bg-gray-100 border-gray-100 text-gray-400 dark:bg-night dark:border-gray-800'
              }`}
            >
              <Link
                key={key}
                href={selected ? '/search' : `/tag/${encodeURIComponent(key)}`}
                className="px-4 py-2 block"
              >
                {`${key} (${tags[key]})`}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default Tags